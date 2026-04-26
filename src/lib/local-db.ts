import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const adminSessionUserId = "__admin__";
const systemAdminActorId = "__system_admin_actor__";

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    passwordHash TEXT,
    avatarUrl TEXT,
    workspaceRole TEXT NOT NULL DEFAULT 'TESTER',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    description TEXT,
    ownerId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS project_members (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    projectId TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'TESTER',
    joinedAt TEXT NOT NULL,
    UNIQUE(userId, projectId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bugs (
    id TEXT PRIMARY KEY,
    bugKey TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    stepsToReproduce TEXT NOT NULL,
    expectedResult TEXT NOT NULL,
    actualResult TEXT NOT NULL,
    module TEXT NOT NULL,
    browser TEXT,
    operatingSystem TEXT,
    device TEXT,
    appVersion TEXT,
    environment TEXT NOT NULL DEFAULT 'STAGING',
    status TEXT NOT NULL DEFAULT 'OPEN',
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    severity TEXT NOT NULL DEFAULT 'MAJOR',
    slaDueAt TEXT,
    closedAt TEXT,
    projectId TEXT NOT NULL,
    reporterId TEXT NOT NULL,
    assigneeId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (reporterId) REFERENCES users(id),
    FOREIGN KEY (assigneeId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bug_activities (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    bugId TEXT NOT NULL,
    actorId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (bugId) REFERENCES bugs(id) ON DELETE CASCADE,
    FOREIGN KEY (actorId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bug_comments (
    id TEXT PRIMARY KEY,
    body TEXT NOT NULL,
    bugId TEXT NOT NULL,
    authorId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (bugId) REFERENCES bugs(id) ON DELETE CASCADE,
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    href TEXT,
    readAt TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );
`);

db.prepare("UPDATE users SET workspaceRole = 'MANAGER' WHERE workspaceRole = 'ADMIN' AND id != ?").run(
  systemAdminActorId,
);

export type DbUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  avatarUrl: string | null;
  workspaceRole: string;
};

export type DbProject = {
  id: string;
  key: string;
  name: string;
  owner: string;
  openBugs: number;
  criticalBugs: number;
  members: number;
};

export type DbBug = {
  id: string;
  bugKey: string;
  title: string;
  module: string;
  status: string;
  priority: string;
  assignee: string | null;
  project: string;
  slaDueAt: string | null;
};

export type SimilarBug = DbBug & {
  score: number;
};

export type DbBugDetail = DbBug & {
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  browser: string | null;
  operatingSystem: string | null;
  device: string | null;
  appVersion: string | null;
  environment: string;
  severity: string;
  reporter: string;
  reporterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DbActivity = {
  id: string;
  action: string;
  details: string | null;
  actor: string;
  createdAt: string;
};

export type DbComment = {
  id: string;
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

export type DbTeamMember = {
  id: string;
  name: string;
  email: string;
  workspaceRole: string;
  project: string;
  projectKey: string;
  role: string;
  openAssigned: number;
  joinedAt: string;
};

export type DbNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  readAt: string | null;
  createdAt: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  workspaceRole: string;
  createdAt: string;
  memberships: number;
  assignedBugs: number;
};

export type AdminProjectRow = {
  id: string;
  key: string;
  name: string;
  owner: string;
  members: number;
  totalBugs: number;
  openBugs: number;
  createdAt: string;
};

export type AdminControlBug = DbBug & {
  severity: string;
  environment: string;
  assigneeId: string | null;
  reporter: string;
  updatedAt: string;
};

export type AdminSnapshot = {
  totals: {
    users: number;
    projects: number;
    bugs: number;
    open: number;
    critical: number;
  };
  users: AdminUserRow[];
  projects: AdminProjectRow[];
};

export type DashboardSnapshot = {
  stats: Array<{ label: string; value: string }>;
  columns: Array<{ title: string; bugs: DbBug[] }>;
  slaWatch: DbBug[];
  workload: Array<{ name: string; count: number; width: string }>;
  recentActivity: Array<{
    id: string;
    action: string;
    actor: string;
    bugId: string;
    bugKey: string;
    title: string;
    createdAt: string;
  }>;
  unreadNotifications: number;
};

export type ReportSnapshot = {
  totals: {
    projects: number;
    bugs: number;
    open: number;
    closed: number;
    critical: number;
    overdue: number;
  };
  statusRows: Array<{ label: string; count: number; width: string }>;
  priorityRows: Array<{ label: string; count: number; width: string }>;
  projectRows: Array<{
    id: string;
    key: string;
    name: string;
    openBugs: number;
    closedBugs: number;
    criticalBugs: number;
    totalBugs: number;
  }>;
  moduleRows: Array<{ module: string; count: number; width: string }>;
  weeklyRows: Array<{ day: string; created: number; closed: number }>;
};

function now() {
  return new Date().toISOString();
}

function projectKeyFromName(name: string) {
  return (
    name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 4)
      .toUpperCase() || "BUG"
  );
}

function uniqueProjectKey(baseKey: string) {
  let key = baseKey;
  let index = 1;
  const exists = db.prepare("SELECT id FROM projects WHERE key = ?");

  while (exists.get(key)) {
    index += 1;
    key = `${baseKey}${index}`;
  }

  return key;
}

export function findUserByEmail(email: string) {
  return db
    .prepare("SELECT id, name, email, passwordHash, avatarUrl, workspaceRole FROM users WHERE email = ?")
    .get(email) as DbUser | undefined;
}

export function findUserById(userId: string) {
  return db
    .prepare("SELECT id, name, email, passwordHash, avatarUrl, workspaceRole FROM users WHERE id = ?")
    .get(userId) as DbUser | undefined;
}

export function updateUserProfile(userId: string, input: { name: string }) {
  db.prepare("UPDATE users SET name = ?, updatedAt = ? WHERE id = ?").run(input.name, now(), userId);
}

export function countAdmins() {
  const row = db.prepare("SELECT COUNT(*) AS count FROM users WHERE workspaceRole = 'ADMIN'").get() as {
    count: number;
  };

  return row.count;
}

export function updateUserWorkspaceRole(userId: string, role: string) {
  db.prepare("UPDATE users SET workspaceRole = ?, updatedAt = ? WHERE id = ?").run(role, now(), userId);
}

function userIsAdmin(userId: string) {
  return userId === adminSessionUserId || findUserById(userId)?.workspaceRole === "ADMIN";
}

export function getSystemAdminActorId() {
  const timestamp = now();
  const existing = db.prepare("SELECT id FROM users WHERE id = ?").get(systemAdminActorId);

  if (!existing) {
    db.prepare(
      `INSERT INTO users (id, name, email, workspaceRole, createdAt, updatedAt)
       VALUES (?, 'System Admin', 'system-admin@ebug.local', 'ADMIN', ?, ?)`,
    ).run(systemAdminActorId, timestamp, timestamp);
  }

  return systemAdminActorId;
}

export function createUserWithProject(input: {
  name: string;
  email: string;
  passwordHash: string;
  workspaceName: string;
}) {
  return db.transaction(() => {
    const timestamp = now();
    const userId = randomUUID();
    const projectId = randomUUID();
    const memberId = randomUUID();
    const projectKey = uniqueProjectKey(projectKeyFromName(input.workspaceName));

    db.prepare(
      `INSERT INTO users (id, name, email, passwordHash, workspaceRole, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, 'MANAGER', ?, ?)`,
    ).run(userId, input.name, input.email, input.passwordHash, timestamp, timestamp);

    db.prepare(
      `INSERT INTO projects (id, name, key, description, ownerId, createdAt, updatedAt)
       VALUES (?, ?, ?, 'Default workspace project', ?, ?, ?)`,
    ).run(projectId, input.workspaceName, projectKey, userId, timestamp, timestamp);

    db.prepare(
      `INSERT INTO project_members (id, userId, projectId, role, joinedAt)
       VALUES (?, ?, ?, 'OWNER', ?)`,
    ).run(memberId, userId, projectId, timestamp);

    return userId;
  })();
}

export function projectKeyExists(key: string) {
  return Boolean(db.prepare("SELECT id FROM projects WHERE key = ?").get(key));
}

export function createProjectForOwner(input: {
  ownerId: string;
  name: string;
  key: string;
  description?: string;
}) {
  return db.transaction(() => {
    const timestamp = now();
    const projectId = randomUUID();

    db.prepare(
      `INSERT INTO projects (id, name, key, description, ownerId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(projectId, input.name, input.key, input.description ?? null, input.ownerId, timestamp, timestamp);

    db.prepare(
      `INSERT INTO project_members (id, userId, projectId, role, joinedAt)
       VALUES (?, ?, ?, 'OWNER', ?)`,
    ).run(randomUUID(), input.ownerId, projectId, timestamp);

    return projectId;
  })();
}

export function listProjectsForUser(userId: string) {
  if (userIsAdmin(userId)) {
    return db
      .prepare(
        `SELECT
          p.id,
          p.key,
          p.name,
          owner.name AS owner,
          COUNT(DISTINCT b.id) AS openBugs,
          SUM(CASE WHEN b.priority = 'CRITICAL' AND b.status != 'CLOSED' THEN 1 ELSE 0 END) AS criticalBugs,
          COUNT(DISTINCT pmAll.id) AS members
        FROM projects p
        JOIN users owner ON owner.id = p.ownerId
        LEFT JOIN project_members pmAll ON pmAll.projectId = p.id
        LEFT JOIN bugs b ON b.projectId = p.id AND b.status != 'CLOSED'
        GROUP BY p.id
        ORDER BY p.createdAt DESC`,
      )
      .all() as DbProject[];
  }

  return db
    .prepare(
      `SELECT
        p.id,
        p.key,
        p.name,
        owner.name AS owner,
        COUNT(DISTINCT b.id) AS openBugs,
        SUM(CASE WHEN b.priority = 'CRITICAL' AND b.status != 'CLOSED' THEN 1 ELSE 0 END) AS criticalBugs,
        COUNT(DISTINCT pmAll.id) AS members
      FROM projects p
      JOIN project_members pm ON pm.projectId = p.id
      JOIN users owner ON owner.id = p.ownerId
      LEFT JOIN project_members pmAll ON pmAll.projectId = p.id
      LEFT JOIN bugs b ON b.projectId = p.id AND b.status != 'CLOSED'
      WHERE pm.userId = ?
      GROUP BY p.id
      ORDER BY p.createdAt DESC`,
    )
    .all(userId) as DbProject[];
}

export function getAdminSnapshot(): AdminSnapshot {
  const totals = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM users) AS users,
        (SELECT COUNT(*) FROM projects) AS projects,
        (SELECT COUNT(*) FROM bugs) AS bugs,
        (SELECT COUNT(*) FROM bugs WHERE status != 'CLOSED') AS open,
        (SELECT COUNT(*) FROM bugs WHERE priority = 'CRITICAL' AND status != 'CLOSED') AS critical`,
    )
    .get() as AdminSnapshot["totals"];

  const users = db
    .prepare(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.workspaceRole,
        u.createdAt,
        COUNT(DISTINCT pm.id) AS memberships,
        COUNT(DISTINCT b.id) AS assignedBugs
       FROM users u
       LEFT JOIN project_members pm ON pm.userId = u.id
       LEFT JOIN bugs b ON b.assigneeId = u.id AND b.status != 'CLOSED'
       WHERE u.id != ?
       GROUP BY u.id
       ORDER BY
         CASE u.workspaceRole
           WHEN 'ADMIN' THEN 1
           WHEN 'MANAGER' THEN 2
           WHEN 'DEVELOPER' THEN 3
           WHEN 'TESTER' THEN 4
           ELSE 5
         END,
         u.createdAt DESC`,
    )
    .all(systemAdminActorId) as AdminUserRow[];

  const projects = db
    .prepare(
      `SELECT
        p.id,
        p.key,
        p.name,
        owner.name AS owner,
        p.createdAt,
        COUNT(DISTINCT pm.id) AS members,
        COUNT(DISTINCT b.id) AS totalBugs,
        SUM(CASE WHEN b.status != 'CLOSED' THEN 1 ELSE 0 END) AS openBugs
       FROM projects p
       JOIN users owner ON owner.id = p.ownerId
       LEFT JOIN project_members pm ON pm.projectId = p.id
       LEFT JOIN bugs b ON b.projectId = p.id
       GROUP BY p.id
       ORDER BY p.createdAt DESC`,
    )
    .all() as AdminProjectRow[];

  return { totals, users, projects };
}

export function listWorkspaceUsersForAssignment() {
  return db
    .prepare(
      `SELECT id, name
       FROM users
       WHERE id != ?
       ORDER BY name ASC`,
    )
    .all(systemAdminActorId) as Array<{ id: string; name: string }>;
}

export function listAdminControlBugs() {
  return db
    .prepare(
      `SELECT
        b.id,
        b.bugKey,
        b.title,
        b.module,
        b.status,
        b.priority,
        b.severity,
        b.environment,
        b.assigneeId,
        assignee.name AS assignee,
        reporter.name AS reporter,
        p.name AS project,
        b.slaDueAt,
        b.updatedAt
       FROM bugs b
       JOIN projects p ON p.id = b.projectId
       JOIN users reporter ON reporter.id = b.reporterId
       LEFT JOIN users assignee ON assignee.id = b.assigneeId
       WHERE b.status != 'CLOSED'
       ORDER BY
        CASE b.priority
          WHEN 'CRITICAL' THEN 1
          WHEN 'HIGH' THEN 2
          WHEN 'MEDIUM' THEN 3
          ELSE 4
        END,
        b.updatedAt DESC
       LIMIT 12`,
    )
    .all() as AdminControlBug[];
}

export function listProjectOptionsForUser(userId: string) {
  if (userIsAdmin(userId)) {
    return db
      .prepare(
        `SELECT p.id, p.name
         FROM projects p
         ORDER BY p.createdAt DESC`,
      )
      .all() as Array<{ id: string; name: string }>;
  }

  return db
    .prepare(
      `SELECT p.id, p.name
       FROM projects p
       JOIN project_members pm ON pm.projectId = p.id
       WHERE pm.userId = ?
       ORDER BY p.createdAt DESC`,
    )
    .all(userId) as Array<{ id: string; name: string }>;
}

export function listTeamMembersForUser(userId: string) {
  if (userIsAdmin(userId)) {
    return db
      .prepare(
        `SELECT
          u.id,
          u.name,
          u.email,
          u.workspaceRole,
          p.name AS project,
          p.key AS projectKey,
          pm.role,
          pm.joinedAt,
          COUNT(DISTINCT b.id) AS openAssigned
         FROM project_members pm
         JOIN projects p ON p.id = pm.projectId
         JOIN users u ON u.id = pm.userId
         LEFT JOIN bugs b ON b.assigneeId = u.id AND b.projectId = p.id AND b.status != 'CLOSED'
         GROUP BY u.id, p.id, pm.role
         ORDER BY p.createdAt DESC, u.name ASC`,
      )
      .all() as DbTeamMember[];
  }

  return db
    .prepare(
      `SELECT
        u.id,
        u.name,
        u.email,
        u.workspaceRole,
        p.name AS project,
        p.key AS projectKey,
        pm.role,
        pm.joinedAt,
        COUNT(DISTINCT b.id) AS openAssigned
       FROM project_members viewer
       JOIN projects p ON p.id = viewer.projectId
       JOIN project_members pm ON pm.projectId = p.id
       JOIN users u ON u.id = pm.userId
       LEFT JOIN bugs b ON b.assigneeId = u.id AND b.projectId = p.id AND b.status != 'CLOSED'
       WHERE viewer.userId = ?
       GROUP BY u.id, p.id, pm.role
       ORDER BY p.createdAt DESC, u.name ASC`,
    )
    .all(userId) as DbTeamMember[];
}

export function addOrCreateProjectMember(input: {
  name: string;
  email: string;
  projectId: string;
  role: string;
}) {
  return db.transaction(() => {
    const timestamp = now();
    let user = findUserByEmail(input.email);

    if (!user) {
      const userId = randomUUID();

      db.prepare(
        `INSERT INTO users (id, name, email, workspaceRole, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(userId, input.name, input.email, input.role, timestamp, timestamp);

      user = {
        id: userId,
        name: input.name,
        email: input.email,
        passwordHash: null,
        avatarUrl: null,
        workspaceRole: input.role,
      };
    }

    const existingMembership = db
      .prepare("SELECT id FROM project_members WHERE userId = ? AND projectId = ?")
      .get(user.id, input.projectId);

    if (existingMembership) {
      db.prepare("UPDATE project_members SET role = ? WHERE userId = ? AND projectId = ?").run(
        input.role,
        user.id,
        input.projectId,
      );
      return user.id;
    }

    db.prepare(
      `INSERT INTO project_members (id, userId, projectId, role, joinedAt)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(randomUUID(), user.id, input.projectId, input.role, timestamp);

    return user.id;
  })();
}

export function listBugsForUser(userId: string) {
  if (userIsAdmin(userId)) {
    return db
      .prepare(
        `SELECT
          b.id,
          b.bugKey,
          b.title,
          b.module,
          b.status,
          b.priority,
          assignee.name AS assignee,
          p.name AS project,
          b.slaDueAt
        FROM bugs b
        JOIN projects p ON p.id = b.projectId
        LEFT JOIN users assignee ON assignee.id = b.assigneeId
        ORDER BY b.createdAt DESC`,
      )
      .all() as DbBug[];
  }

  return db
    .prepare(
      `SELECT
        b.id,
        b.bugKey,
        b.title,
        b.module,
        b.status,
        b.priority,
        assignee.name AS assignee,
        p.name AS project,
        b.slaDueAt
      FROM bugs b
      JOIN projects p ON p.id = b.projectId
      JOIN project_members pm ON pm.projectId = p.id
      LEFT JOIN users assignee ON assignee.id = b.assigneeId
      WHERE pm.userId = ?
      ORDER BY b.createdAt DESC`,
    )
    .all(userId) as DbBug[];
}

export function searchBugsForUser(userId: string, query: string, status?: string) {
  const trimmedQuery = query.trim();
  const likeQuery = `%${trimmedQuery}%`;
  const isAdmin = userIsAdmin(userId);

  if (trimmedQuery && status) {
    const membershipJoin = isAdmin ? "" : "JOIN project_members pm ON pm.projectId = p.id";
    const userScope = isAdmin ? "" : "pm.userId = ? AND";
    const statement = db.prepare(
      `SELECT
        b.id, b.bugKey, b.title, b.module, b.status, b.priority,
        assignee.name AS assignee, p.name AS project, b.slaDueAt
      FROM bugs b
      JOIN projects p ON p.id = b.projectId
      ${membershipJoin}
      LEFT JOIN users assignee ON assignee.id = b.assigneeId
      WHERE ${userScope} b.status = ?
        AND (b.bugKey LIKE ? OR b.title LIKE ? OR b.module LIKE ? OR p.name LIKE ? OR assignee.name LIKE ?)
      ORDER BY b.createdAt DESC`,
    );

    return (isAdmin
      ? statement.all(status, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery)
      : statement.all(userId, status, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery)) as DbBug[];
  }

  if (trimmedQuery) {
    const membershipJoin = isAdmin ? "" : "JOIN project_members pm ON pm.projectId = p.id";
    const userScope = isAdmin ? "" : "pm.userId = ? AND";
    const statement = db.prepare(
      `SELECT
        b.id, b.bugKey, b.title, b.module, b.status, b.priority,
        assignee.name AS assignee, p.name AS project, b.slaDueAt
      FROM bugs b
      JOIN projects p ON p.id = b.projectId
      ${membershipJoin}
      LEFT JOIN users assignee ON assignee.id = b.assigneeId
      WHERE ${userScope} (b.bugKey LIKE ? OR b.title LIKE ? OR b.module LIKE ? OR p.name LIKE ? OR assignee.name LIKE ?)
      ORDER BY b.createdAt DESC`,
    );

    return (isAdmin
      ? statement.all(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery)
      : statement.all(userId, likeQuery, likeQuery, likeQuery, likeQuery, likeQuery)) as DbBug[];
  }

  if (status) {
    if (isAdmin) {
      return db
        .prepare(
          `SELECT
            b.id, b.bugKey, b.title, b.module, b.status, b.priority,
            assignee.name AS assignee, p.name AS project, b.slaDueAt
          FROM bugs b
          JOIN projects p ON p.id = b.projectId
          LEFT JOIN users assignee ON assignee.id = b.assigneeId
          WHERE b.status = ?
          ORDER BY b.createdAt DESC`,
        )
        .all(status) as DbBug[];
    }

    return db
        .prepare(
          `SELECT
            b.id, b.bugKey, b.title, b.module, b.status, b.priority,
            assignee.name AS assignee, p.name AS project, b.slaDueAt
          FROM bugs b
          JOIN projects p ON p.id = b.projectId
          JOIN project_members pm ON pm.projectId = p.id
          LEFT JOIN users assignee ON assignee.id = b.assigneeId
          WHERE pm.userId = ? AND b.status = ?
          ORDER BY b.createdAt DESC`,
        )
        .all(userId, status) as DbBug[];
  }

  return listBugsForUser(userId);
}

function keywordSet(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 4),
  );
}

export function findSimilarBugsForUser(userId: string, input: { title: string; module: string; description: string }) {
  const queryWords = keywordSet(`${input.title} ${input.module} ${input.description}`);

  if (queryWords.size === 0) {
    return [];
  }

  return listBugsForUser(userId)
    .map((bug) => {
      const bugWords = keywordSet(`${bug.title} ${bug.module} ${bug.project}`);
      let score = input.module && bug.module.toLowerCase() === input.module.toLowerCase() ? 3 : 0;

      for (const word of queryWords) {
        if (bugWords.has(word)) {
          score += 1;
        }
      }

      return { ...bug, score };
    })
    .filter((bug) => bug.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4) satisfies SimilarBug[];
}

export function getDashboardSnapshot(userId: string): DashboardSnapshot {
  const isAdmin = userIsAdmin(userId);
  const bugs = listBugsForUser(userId);
  const openBugs = bugs.filter((bug) => bug.status !== "CLOSED");
  const criticalBugs = openBugs.filter((bug) => bug.priority === "CRITICAL");
  const inProgressBugs = bugs.filter((bug) => bug.status === "IN_PROGRESS");
  const resolvedBugs = bugs.filter((bug) => bug.status === "RESOLVED");

  const columns = [
    { title: "Open", bugs: bugs.filter((bug) => bug.status === "OPEN") },
    { title: "Triaged", bugs: bugs.filter((bug) => bug.status === "TRIAGED") },
    { title: "In Progress", bugs: inProgressBugs },
    { title: "QA Verify", bugs: bugs.filter((bug) => bug.status === "QA_VERIFY" || bug.status === "RESOLVED") },
  ];

  const workloadRows = db
    .prepare(
      `SELECT COALESCE(assignee.name, 'Unassigned') AS name, COUNT(*) AS count
       FROM bugs b
       JOIN projects p ON p.id = b.projectId
       ${isAdmin ? "" : "JOIN project_members pm ON pm.projectId = p.id"}
       LEFT JOIN users assignee ON assignee.id = b.assigneeId
       WHERE ${isAdmin ? "" : "pm.userId = ? AND"} b.status != 'CLOSED'
       GROUP BY COALESCE(assignee.name, 'Unassigned')
       ORDER BY count DESC
       LIMIT 5`,
    );
  const workload = (isAdmin ? workloadRows.all() : workloadRows.all(userId)) as Array<{ name: string; count: number }>;

  const maxCount = Math.max(...workload.map((row) => row.count), 1);

  return {
    stats: [
      { label: "Open bugs", value: openBugs.length.toString() },
      { label: "Critical", value: criticalBugs.length.toString() },
      { label: "In progress", value: inProgressBugs.length.toString() },
      { label: "Resolved", value: resolvedBugs.length.toString() },
    ],
    columns,
    slaWatch: openBugs
      .filter((bug) => bug.slaDueAt)
      .sort((a, b) => new Date(a.slaDueAt ?? 0).getTime() - new Date(b.slaDueAt ?? 0).getTime())
      .slice(0, 3),
    workload: workload.map((row) => ({
      ...row,
      width: `${Math.max(16, Math.round((row.count / maxCount) * 100))}%`,
    })),
    recentActivity: (isAdmin
      ? db
          .prepare(
            `SELECT
              a.id,
              a.action,
              actor.name AS actor,
              b.id AS bugId,
              b.bugKey,
              b.title,
              a.createdAt
            FROM bug_activities a
            JOIN bugs b ON b.id = a.bugId
            JOIN users actor ON actor.id = a.actorId
            ORDER BY a.createdAt DESC
            LIMIT 5`,
          )
          .all()
      : db
      .prepare(
        `SELECT
          a.id,
          a.action,
          actor.name AS actor,
          b.id AS bugId,
          b.bugKey,
          b.title,
          a.createdAt
        FROM bug_activities a
        JOIN bugs b ON b.id = a.bugId
        JOIN projects p ON p.id = b.projectId
        JOIN project_members pm ON pm.projectId = p.id
        JOIN users actor ON actor.id = a.actorId
        WHERE pm.userId = ?
        ORDER BY a.createdAt DESC
        LIMIT 5`,
      )
      .all(userId)) as DashboardSnapshot["recentActivity"],
    unreadNotifications: getUnreadNotificationCount(userId),
  };
}

function withWidths<T extends { count: number }>(rows: T[]) {
  const maxCount = Math.max(...rows.map((row) => row.count), 1);

  return rows.map((row) => ({
    ...row,
    width: `${Math.max(8, Math.round((row.count / maxCount) * 100))}%`,
  }));
}

export function getReportSnapshot(userId: string): ReportSnapshot {
  const isAdmin = userIsAdmin(userId);
  const bugs = listBugsForUser(userId);
  const projects = listProjectsForUser(userId);
  const nowDate = new Date();

  const statusCounts = new Map<string, number>();
  const priorityCounts = new Map<string, number>();

  for (const bug of bugs) {
    statusCounts.set(bug.status, (statusCounts.get(bug.status) ?? 0) + 1);
    priorityCounts.set(bug.priority, (priorityCounts.get(bug.priority) ?? 0) + 1);
  }

  const projectRows = (isAdmin
    ? db.prepare(
      `SELECT
        p.id,
        p.key,
        p.name,
        SUM(CASE WHEN b.status != 'CLOSED' THEN 1 ELSE 0 END) AS openBugs,
        SUM(CASE WHEN b.status = 'CLOSED' THEN 1 ELSE 0 END) AS closedBugs,
        SUM(CASE WHEN b.priority = 'CRITICAL' AND b.status != 'CLOSED' THEN 1 ELSE 0 END) AS criticalBugs,
        COUNT(b.id) AS totalBugs
      FROM projects p
      LEFT JOIN bugs b ON b.projectId = p.id
      GROUP BY p.id
      ORDER BY totalBugs DESC, p.createdAt DESC`,
    ).all()
    : db
      .prepare(
      `SELECT
        p.id,
        p.key,
        p.name,
        SUM(CASE WHEN b.status != 'CLOSED' THEN 1 ELSE 0 END) AS openBugs,
        SUM(CASE WHEN b.status = 'CLOSED' THEN 1 ELSE 0 END) AS closedBugs,
        SUM(CASE WHEN b.priority = 'CRITICAL' AND b.status != 'CLOSED' THEN 1 ELSE 0 END) AS criticalBugs,
        COUNT(b.id) AS totalBugs
      FROM projects p
      JOIN project_members pm ON pm.projectId = p.id
      LEFT JOIN bugs b ON b.projectId = p.id
      WHERE pm.userId = ?
      GROUP BY p.id
      ORDER BY totalBugs DESC, p.createdAt DESC`,
    )
    .all(userId)) as ReportSnapshot["projectRows"];

  const moduleCounts = (isAdmin
    ? db.prepare(
      `SELECT b.module, COUNT(*) AS count
       FROM bugs b
       GROUP BY b.module
       ORDER BY count DESC
       LIMIT 6`,
    ).all()
    : db
      .prepare(
      `SELECT b.module, COUNT(*) AS count
       FROM bugs b
       JOIN projects p ON p.id = b.projectId
       JOIN project_members pm ON pm.projectId = p.id
       WHERE pm.userId = ?
       GROUP BY b.module
       ORDER BY count DESC
       LIMIT 6`,
    )
    .all(userId)) as Array<{ module: string; count: number }>;

  const weeklyRows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(nowDate);
    date.setDate(nowDate.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    return {
      day: date.toLocaleDateString("en-IN", { weekday: "short" }),
      created: (isAdmin
        ? db
            .prepare(
              `SELECT COUNT(*) AS count
               FROM bugs b
               WHERE substr(b.createdAt, 1, 10) = ?`,
            )
            .get(key)
        : db
          .prepare(
          `SELECT COUNT(*) AS count
           FROM bugs b
           JOIN projects p ON p.id = b.projectId
           JOIN project_members pm ON pm.projectId = p.id
           WHERE pm.userId = ? AND substr(b.createdAt, 1, 10) = ?`,
        )
        .get(userId, key)) as { count: number },
      closed: (isAdmin
        ? db
            .prepare(
              `SELECT COUNT(*) AS count
               FROM bugs b
               WHERE b.closedAt IS NOT NULL AND substr(b.closedAt, 1, 10) = ?`,
            )
            .get(key)
        : db
          .prepare(
          `SELECT COUNT(*) AS count
           FROM bugs b
           JOIN projects p ON p.id = b.projectId
           JOIN project_members pm ON pm.projectId = p.id
           WHERE pm.userId = ? AND b.closedAt IS NOT NULL AND substr(b.closedAt, 1, 10) = ?`,
        )
        .get(userId, key)) as { count: number },
    };
  }).map((row) => ({
    day: row.day,
    created: row.created.count,
    closed: row.closed.count,
  }));

  return {
    totals: {
      projects: projects.length,
      bugs: bugs.length,
      open: bugs.filter((bug) => bug.status !== "CLOSED").length,
      closed: bugs.filter((bug) => bug.status === "CLOSED").length,
      critical: bugs.filter((bug) => bug.priority === "CRITICAL" && bug.status !== "CLOSED").length,
      overdue: bugs.filter(
        (bug) => bug.slaDueAt && bug.status !== "CLOSED" && new Date(bug.slaDueAt).getTime() < nowDate.getTime(),
      ).length,
    },
    statusRows: withWidths(
      Array.from(statusCounts.entries()).map(([label, count]) => ({
        label,
        count,
      })),
    ),
    priorityRows: withWidths(
      Array.from(priorityCounts.entries()).map(([label, count]) => ({
        label,
        count,
      })),
    ),
    projectRows,
    moduleRows: withWidths(moduleCounts),
    weeklyRows,
  };
}

export function getBugForUser(userId: string, bugId: string) {
  if (userIsAdmin(userId)) {
    return db
      .prepare(
        `SELECT
          b.id,
          b.bugKey,
          b.title,
          b.description,
          b.stepsToReproduce,
          b.expectedResult,
          b.actualResult,
          b.module,
          b.browser,
          b.operatingSystem,
          b.device,
          b.appVersion,
          b.environment,
          b.status,
          b.priority,
          b.severity,
          b.slaDueAt,
          b.reporterId,
          b.assigneeId,
          b.createdAt,
          b.updatedAt,
          reporter.name AS reporter,
          assignee.name AS assignee,
          p.name AS project
        FROM bugs b
        JOIN projects p ON p.id = b.projectId
        JOIN users reporter ON reporter.id = b.reporterId
        LEFT JOIN users assignee ON assignee.id = b.assigneeId
        WHERE b.id = ?`,
      )
      .get(bugId) as DbBugDetail | undefined;
  }

  return db
    .prepare(
      `SELECT
        b.id,
        b.bugKey,
        b.title,
        b.description,
        b.stepsToReproduce,
        b.expectedResult,
        b.actualResult,
        b.module,
        b.browser,
        b.operatingSystem,
        b.device,
        b.appVersion,
        b.environment,
        b.status,
        b.priority,
        b.severity,
        b.slaDueAt,
        b.reporterId,
        b.assigneeId,
        b.createdAt,
        b.updatedAt,
        reporter.name AS reporter,
        assignee.name AS assignee,
        p.name AS project
      FROM bugs b
      JOIN projects p ON p.id = b.projectId
      JOIN project_members pm ON pm.projectId = p.id
      JOIN users reporter ON reporter.id = b.reporterId
      LEFT JOIN users assignee ON assignee.id = b.assigneeId
      WHERE pm.userId = ? AND b.id = ?`,
    )
    .get(userId, bugId) as DbBugDetail | undefined;
}

export function listBugActivitiesForUser(userId: string, bugId: string) {
  const bug = getBugForUser(userId, bugId);

  if (!bug) {
    return [];
  }

  return db
    .prepare(
      `SELECT a.id, a.action, a.details, actor.name AS actor, a.createdAt
       FROM bug_activities a
       JOIN users actor ON actor.id = a.actorId
       WHERE a.bugId = ?
       ORDER BY a.createdAt DESC`,
    )
    .all(bugId) as DbActivity[];
}

export function listBugCommentsForUser(userId: string, bugId: string) {
  const bug = getBugForUser(userId, bugId);

  if (!bug) {
    return [];
  }

  return db
    .prepare(
      `SELECT c.id, c.body, author.name AS author, c.createdAt, c.updatedAt
       FROM bug_comments c
       JOIN users author ON author.id = c.authorId
       WHERE c.bugId = ?
       ORDER BY c.createdAt ASC`,
    )
    .all(bugId) as DbComment[];
}

export function listAssignableUsersForBug(userId: string, bugId: string) {
  const bug = getBugForUser(userId, bugId);

  if (!bug) {
    return [];
  }

  return db
    .prepare(
      `SELECT u.id, u.name
       FROM users u
       JOIN project_members pm ON pm.userId = u.id
       JOIN bugs b ON b.projectId = pm.projectId
       WHERE b.id = ?
       ORDER BY u.name ASC`,
    )
    .all(bugId) as Array<{ id: string; name: string }>;
}

export function userCanAccessProject(userId: string, projectId: string) {
  if (userIsAdmin(userId)) {
    return db.prepare("SELECT key FROM projects WHERE id = ?").get(projectId) as { key: string } | undefined;
  }

  const row = db
    .prepare(
      `SELECT p.key
       FROM project_members pm
       JOIN projects p ON p.id = pm.projectId
       WHERE pm.userId = ? AND pm.projectId = ?`,
    )
    .get(userId, projectId) as { key: string } | undefined;

  return row;
}

export function countProjectBugs(projectId: string) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM bugs WHERE projectId = ?").get(projectId) as {
    count: number;
  };

  return row.count;
}

export function createBug(input: {
  bugKey: string;
  title: string;
  description: string;
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  module: string;
  browser?: string;
  operatingSystem?: string;
  device?: string;
  appVersion?: string;
  environment: string;
  priority: string;
  severity: string;
  slaDueAt: Date;
  projectId: string;
  reporterId: string;
}) {
  return db.transaction(() => {
    const timestamp = now();
    const bugId = randomUUID();

    db.prepare(
      `INSERT INTO bugs (
        id, bugKey, title, description, stepsToReproduce, expectedResult, actualResult,
        module, browser, operatingSystem, device, appVersion, environment, priority,
        severity, slaDueAt, projectId, reporterId, createdAt, updatedAt
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      bugId,
      input.bugKey,
      input.title,
      input.description,
      input.stepsToReproduce,
      input.expectedResult,
      input.actualResult,
      input.module,
      input.browser ?? null,
      input.operatingSystem ?? null,
      input.device ?? null,
      input.appVersion ?? null,
      input.environment,
      input.priority,
      input.severity,
      input.slaDueAt.toISOString(),
      input.projectId,
      input.reporterId,
      timestamp,
      timestamp,
    );

    db.prepare(
      `INSERT INTO bug_activities (id, action, details, bugId, actorId, createdAt)
       VALUES (?, 'CREATED', ?, ?, ?, ?)`,
    ).run(
      randomUUID(),
      JSON.stringify({
        title: input.title,
        priority: input.priority,
        severity: input.severity,
      }),
      bugId,
      input.reporterId,
      timestamp,
    );

    createNotification({
      userId: input.reporterId,
      type: "BUG_CREATED",
      title: `${input.bugKey} created`,
      body: input.title,
      href: `/bugs/${bugId}`,
    });
  })();
}

export function updateBugWorkflow(input: {
  bugId: string;
  actorId: string;
  status: string;
  assigneeId?: string | null;
}) {
  return db.transaction(() => {
    const timestamp = now();
    const existing = db
      .prepare("SELECT status, assigneeId FROM bugs WHERE id = ?")
      .get(input.bugId) as { status: string; assigneeId: string | null } | undefined;

    if (!existing) {
      return;
    }

    const closedAt = input.status === "CLOSED" ? timestamp : null;

    db.prepare(
      `UPDATE bugs
       SET status = ?, assigneeId = ?, closedAt = ?, updatedAt = ?
       WHERE id = ?`,
    ).run(input.status, input.assigneeId ?? null, closedAt, timestamp, input.bugId);

    db.prepare(
      `INSERT INTO bug_activities (id, action, details, bugId, actorId, createdAt)
       VALUES (?, 'STATUS_CHANGED', ?, ?, ?, ?)`,
    ).run(
      randomUUID(),
      JSON.stringify({
        from: existing.status,
        to: input.status,
        assigneeChanged: existing.assigneeId !== (input.assigneeId ?? null),
      }),
      input.bugId,
      input.actorId,
      timestamp,
    );

    const bug = db.prepare("SELECT bugKey, title, reporterId, assigneeId FROM bugs WHERE id = ?").get(input.bugId) as
      | { bugKey: string; title: string; reporterId: string; assigneeId: string | null }
      | undefined;

    if (bug) {
      const recipients = new Set([bug.reporterId, input.assigneeId ?? bug.assigneeId].filter(Boolean) as string[]);

      for (const userId of recipients) {
        createNotification({
          userId,
          type: "STATUS_CHANGED",
          title: `${bug.bugKey} moved to ${input.status.replaceAll("_", " ")}`,
          body: bug.title,
          href: `/bugs/${input.bugId}`,
        });
      }
    }
  })();
}

export function addBugComment(input: {
  bugId: string;
  authorId: string;
  body: string;
}) {
  return db.transaction(() => {
    const timestamp = now();

    db.prepare(
      `INSERT INTO bug_comments (id, body, bugId, authorId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(randomUUID(), input.body, input.bugId, input.authorId, timestamp, timestamp);

    db.prepare(
      `INSERT INTO bug_activities (id, action, details, bugId, actorId, createdAt)
       VALUES (?, 'COMMENTED', ?, ?, ?, ?)`,
    ).run(
      randomUUID(),
      JSON.stringify({
        preview: input.body.slice(0, 80),
      }),
      input.bugId,
      input.authorId,
      timestamp,
    );

    const bug = db.prepare("SELECT bugKey, title, reporterId, assigneeId FROM bugs WHERE id = ?").get(input.bugId) as
      | { bugKey: string; title: string; reporterId: string; assigneeId: string | null }
      | undefined;

    if (bug) {
      const recipients = new Set([bug.reporterId, bug.assigneeId].filter(Boolean) as string[]);

      for (const userId of recipients) {
        if (userId !== input.authorId) {
          createNotification({
            userId,
            type: "COMMENT_ADDED",
            title: `New comment on ${bug.bugKey}`,
            body: input.body.slice(0, 120),
            href: `/bugs/${input.bugId}`,
          });
        }
      }
    }
  })();
}

export function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
}) {
  db.prepare(
    `INSERT INTO notifications (id, userId, type, title, body, href, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(randomUUID(), input.userId, input.type, input.title, input.body, input.href ?? null, now());
}

export function listNotificationsForUser(userId: string) {
  return db
    .prepare(
      `SELECT id, type, title, body, href, readAt, createdAt
       FROM notifications
       WHERE userId = ?
       ORDER BY createdAt DESC
       LIMIT 50`,
    )
    .all(userId) as DbNotification[];
}

export function getUnreadNotificationCount(userId: string) {
  const row = db
    .prepare("SELECT COUNT(*) AS count FROM notifications WHERE userId = ? AND readAt IS NULL")
    .get(userId) as { count: number };

  return row.count;
}

export function markNotificationRead(userId: string, notificationId: string) {
  db.prepare("UPDATE notifications SET readAt = ? WHERE id = ? AND userId = ?").run(now(), notificationId, userId);
}

export function markAllNotificationsRead(userId: string) {
  db.prepare("UPDATE notifications SET readAt = ? WHERE userId = ? AND readAt IS NULL").run(now(), userId);
}
