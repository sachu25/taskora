import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { AppLayout } from '../../components/layout/AppLayout';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { ProjectsPage } from '../../pages/projects/ProjectsPage';
import { ProjectDetailsPage } from '../../pages/projects/ProjectDetailsPage';
import { TeamsPage } from '../../pages/teams/TeamsPage';
import { MembersPage } from '../../pages/members/MembersPage';

import { IssuesPage } from '../../pages/issues/IssuesPage';
import { ProjectIssuesPage } from '../../pages/issues/ProjectIssuesPage';
import { IssueDetailsPage } from '../../pages/issues/IssueDetailsPage';

import { SprintsPage } from '../../pages/sprints/SprintsPage';
import { SprintDetailsPage } from '../../pages/sprints/SprintDetailsPage';
import { BacklogPage } from '../../pages/backlog/BacklogPage';
import { SprintPlanningPage } from '../../pages/sprint-planning/SprintPlanningPage';
import { KanbanBoardPage } from '../../pages/kanban/KanbanBoardPage';

import { QADashboardPage } from '../../pages/qa/QADashboardPage';
import { TestSuitesPage } from '../../pages/qa/TestSuitesPage';
import { TestSuiteDetailsPage } from '../../pages/qa/TestSuiteDetailsPage';
import { TestCasesPage } from '../../pages/qa/TestCasesPage';
import { TestCaseDetailsPage } from '../../pages/qa/TestCaseDetailsPage';
import { TestRunsPage } from '../../pages/qa/TestRunsPage';
import { TestRunDetailsPage } from '../../pages/qa/TestRunDetailsPage';
import { TestExecutionPage } from '../../pages/qa/TestExecutionPage';

import { ReleasesPage } from '../../pages/releases/ReleasesPage';
import { ReleaseDetailsPage } from '../../pages/releases/ReleaseDetailsPage';

import { NotificationsPage } from '../../pages/NotificationsPage';
import { ActivityPage } from '../../pages/ActivityPage';
import { NotificationPreferencesPage } from '../../pages/NotificationPreferencesPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
        Loading Taskora Workspace...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="projects/:id" element={<ProjectDetailsPage />} />
        <Route path="projects/:projectId/issues" element={<ProjectIssuesPage />} />
        <Route path="projects/:projectId/issues/:issueId" element={<IssueDetailsPage />} />

        {/* Milestone 03B & Milestone 04 Agile & Kanban Routes */}
        <Route path="projects/:projectId/sprints" element={<SprintsPage />} />
        <Route path="projects/:projectId/sprints/:sprintId" element={<SprintDetailsPage />} />
        <Route path="projects/:projectId/sprints/:sprintId/board" element={<KanbanBoardPage />} />
        <Route path="projects/:projectId/backlog" element={<BacklogPage />} />
        <Route path="projects/:projectId/sprint-planning" element={<SprintPlanningPage />} />

        {/* Milestone 05B QA & Test Management Routes */}
        <Route path="projects/:projectId/qa" element={<QADashboardPage />} />
        <Route path="projects/:projectId/test-suites" element={<TestSuitesPage />} />
        <Route path="projects/:projectId/test-suites/:suiteId" element={<TestSuiteDetailsPage />} />
        <Route path="projects/:projectId/test-cases" element={<TestCasesPage />} />
        <Route path="projects/:projectId/test-cases/:testCaseId" element={<TestCaseDetailsPage />} />
        <Route path="projects/:projectId/test-runs" element={<TestRunsPage />} />
        <Route path="projects/:projectId/test-runs/:testRunId" element={<TestRunDetailsPage />} />
        <Route path="projects/:projectId/test-runs/:testRunId/execute" element={<TestExecutionPage />} />

        {/* Milestone 06B Release Management Routes */}
        <Route path="projects/:projectId/releases" element={<ReleasesPage />} />
        <Route path="projects/:projectId/releases/:releaseId" element={<ReleaseDetailsPage />} />

        {/* Milestone 07 Notifications & Activity Routes */}
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings/notification-preferences" element={<NotificationPreferencesPage />} />

        <Route path="issues" element={<IssuesPage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="members" element={<MembersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
