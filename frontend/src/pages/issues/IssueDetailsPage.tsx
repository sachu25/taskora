import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/providers/AuthProvider';
import { issueService } from '../../services/issueService';
import { api } from '../../services/api';
import type {
  ApiResponse,
  Issue,
  IssueComment,
  Label,
  IssueLink,
  IssueWatcher,
  ProjectMember,
  IssueStatus,
  IssuePriority,
  IssueSeverity,
  IssueLinkType,
} from '../../types';
import { IssueTypeBadge } from '../../components/issues/IssueTypeBadge';
import { IssueStatusBadge } from '../../components/issues/IssueStatusBadge';
import { IssuePriorityBadge } from '../../components/issues/IssuePriorityBadge';
import { IssueSeverityBadge } from '../../components/issues/IssueSeverityBadge';
import { IssueComments } from '../../components/issues/IssueComments';
import { IssueLabelsManager } from '../../components/issues/IssueLabelsManager';
import { IssueWatchersToggle } from '../../components/issues/IssueWatchersToggle';
import { IssueFormModal } from '../../components/issues/IssueFormModal';
import { LinkIssueModal } from '../../components/issues/LinkIssueModal';
import { DeleteIssueConfirmModal } from '../../components/issues/DeleteIssueConfirmModal';
import {
  ChevronRight,
  Edit,
  Trash2,
  RotateCcw,
  Link2,
  Clock,
  GitBranch,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const IssueDetailsPage: React.FC = () => {
  const { projectId, issueId } = useParams<{ projectId: string; issueId: string }>();
  const { currentOrg, user } = useAuth();
  const navigate = useNavigate();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [links, setLinks] = useState<IssueLink[]>([]);
  const [watchers, setWatchers] = useState<IssueWatcher[]>([]);
  const [orgLabels, setOrgLabels] = useState<Label[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projectIssues, setProjectIssues] = useState<Issue[]>([]);

  const [loading, setLoading] = useState(true);
  const [watchingLoading, setWatchingLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchIssueData = useCallback(async () => {
    if (!issueId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await issueService.getIssueDetails(issueId);
      setIssue(res.data);

      const [commentsRes, linksRes, watchersRes] = await Promise.all([
        issueService.getIssueComments(issueId),
        issueService.getIssueLinks(issueId),
        issueService.getWatchers(issueId),
      ]);
      setComments(commentsRes.data);
      setLinks(linksRes.data);
      setWatchers(watchersRes.data);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setErrorMsg("You don't have permission to view this issue.");
      } else if (err?.response?.status === 404) {
        setErrorMsg('Issue not found or has been deleted.');
      } else {
        setErrorMsg(err?.response?.data?.message || 'Failed to load issue details.');
      }
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  useEffect(() => {
    fetchIssueData();
  }, [fetchIssueData]);

  useEffect(() => {
    if (!currentOrg || !projectId) return;
    issueService
      .getOrgLabels(currentOrg.id)
      .then((res) => setOrgLabels(res.data))
      .catch((err) => console.error(err));

    api
      .get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`)
      .then((res) => setMembers(res.data.data))
      .catch((err) => console.error(err));

    issueService
      .getProjectIssues(projectId, { per_page: 100 })
      .then((res) => setProjectIssues(res.data.items))
      .catch((err) => console.error(err));
  }, [currentOrg, projectId]);

  // Actions
  const handleUpdateIssue = async (data: Partial<Issue>) => {
    if (!issue) return;
    try {
      const res = await issueService.updateIssue(issue.id, data);
      setIssue(res.data);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update issue.');
    }
  };

  const handleInlineStatusChange = (newStatus: IssueStatus) => {
    handleUpdateIssue({ status: newStatus });
  };

  const handleInlinePriorityChange = (newPriority: IssuePriority) => {
    handleUpdateIssue({ priority: newPriority });
  };

  const handleInlineSeverityChange = (newSeverity: IssueSeverity | '') => {
    handleUpdateIssue({ severity: newSeverity ? (newSeverity as IssueSeverity) : null });
  };

  const handleInlineAssigneeChange = (newAssigneeId: string) => {
    handleUpdateIssue({ assignee_id: newAssigneeId || null });
  };

  const isWatching = watchers.some((w) => w.id === user?.id);
  const handleToggleWatch = async () => {
    if (!issue || !user) return;
    setWatchingLoading(true);
    try {
      if (isWatching) {
        await issueService.unwatchIssue(issue.id, user.id);
      } else {
        await issueService.watchIssue(issue.id);
      }
      const watchersRes = await issueService.getWatchers(issue.id);
      setWatchers(watchersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setWatchingLoading(false);
    }
  };

  const handleAttachLabel = async (labelId: string) => {
    if (!issue) return;
    await issueService.attachLabel(issue.id, labelId);
    fetchIssueData();
  };

  const handleDetachLabel = async (labelId: string) => {
    if (!issue) return;
    await issueService.detachLabel(issue.id, labelId);
    fetchIssueData();
  };

  const handleCreateLink = async (linkedIssueId: string, linkType: IssueLinkType) => {
    if (!issue) return;
    await issueService.createIssueLink(issue.id, linkedIssueId, linkType);
    fetchIssueData();
  };

  const handleDeleteLink = async (linkId: string) => {
    await issueService.deleteIssueLink(linkId);
    fetchIssueData();
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    await issueService.deleteIssue(issue.id);
    navigate(`/projects/${projectId}/issues`);
  };

  const handleRestoreIssue = async () => {
    if (!issue) return;
    const res = await issueService.restoreIssue(issue.id);
    setIssue(res.data);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-900 border border-slate-800 rounded-lg w-48 animate-pulse" />
        <div className="h-24 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (errorMsg || !issue) {
    return (
      <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-100">{errorMsg || 'Issue Not Found'}</h3>
        <p className="text-xs text-slate-400 mt-1">
          {errorMsg ? 'Please check your permissions or network connection.' : 'The requested issue does not exist or has been deleted.'}
        </p>
        <Link
          to={`/projects/${projectId}/issues`}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
        >
          Back to Issues
        </Link>
      </div>
    );
  }

  const isSoftDeleted = Boolean(issue.deleted_at);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/projects" className="hover:text-slate-200">
          Projects
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link to={`/projects/${projectId}/issues`} className="hover:text-slate-200">
          Issues
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="font-mono text-indigo-400 font-bold">{issue.key}</span>
      </nav>

      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20">
                {issue.key}
              </span>
              <IssueTypeBadge type={issue.issue_type} />
              <IssueStatusBadge status={issue.status} />
              <IssuePriorityBadge priority={issue.priority} />
              <IssueSeverityBadge severity={issue.severity} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 leading-tight">{issue.title}</h1>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <IssueWatchersToggle
              isWatching={isWatching}
              watchersCount={watchers.length}
              onToggleWatch={handleToggleWatch}
              isLoading={watchingLoading}
            />

            {!isSoftDeleted ? (
              <>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setLinkModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Link Issue</span>
                </button>
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete Issue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={handleRestoreIssue}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Issue</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Inline Control Bar */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</span>
            <select
              value={issue.status}
              onChange={(e) => handleInlineStatusChange(e.target.value as IssueStatus)}
              className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="backlog">Backlog</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority</span>
            <select
              value={issue.priority}
              onChange={(e) => handleInlinePriorityChange(e.target.value as IssuePriority)}
              className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Severity</span>
            <select
              value={issue.severity || ''}
              onChange={(e) => handleInlineSeverityChange(e.target.value as IssueSeverity | '')}
              className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="">None</option>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
              <option value="blocker">Blocker</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assignee</span>
            <select
              value={issue.assignee?.id || ''}
              onChange={(e) => handleInlineAssigneeChange(e.target.value)}
              className="w-full px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-semibold focus:outline-hidden"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Details, Comments, Linked Issues) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Section */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-slate-100">Description</h3>
            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {issue.description || <span className="text-slate-500 italic">No description provided.</span>}
            </div>
          </div>

          {/* Linked Issues Section */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-400" />
                Linked Issues ({links.length})
              </h3>
              <button
                onClick={() => setLinkModalOpen(true)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                + Link Issue
              </button>
            </div>

            {links.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No linked issues.</p>
            ) : (
              <div className="space-y-2">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 bg-slate-850 border border-slate-800 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold text-[10px]">
                        {link.link_type}
                      </span>
                      <Link
                        to={`/projects/${projectId}/issues/${link.linked_issue.id}`}
                        className="font-mono font-bold text-indigo-400 hover:underline"
                      >
                        {link.linked_issue.key}
                      </Link>
                      <span className="text-slate-200 line-clamp-1">{link.linked_issue.title}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Parent & Child Issues */}
          {(issue.parent || (issue.children && issue.children.length > 0)) && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                Hierarchy
              </h3>

              {issue.parent && (
                <div className="text-xs space-y-1">
                  <span className="text-slate-400 font-semibold block">Parent Issue:</span>
                  <Link
                    to={`/projects/${projectId}/issues/${issue.parent.id}`}
                    className="inline-flex items-center gap-2 p-2 bg-slate-850 border border-slate-800 rounded-lg font-mono text-indigo-400 hover:underline"
                  >
                    <span>{issue.parent.key}</span>
                    <span className="text-slate-300 font-sans">{issue.parent.title}</span>
                  </Link>
                </div>
              )}

              {issue.children && issue.children.length > 0 && (
                <div className="text-xs space-y-1 pt-2">
                  <span className="text-slate-400 font-semibold block">Subtasks & Child Issues:</span>
                  <div className="space-y-1">
                    {issue.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/projects/${projectId}/issues/${child.id}`}
                        className="flex items-center justify-between p-2 bg-slate-850 border border-slate-800 rounded-lg text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-indigo-400 font-bold">{child.key}</span>
                          <span className="text-slate-200 line-clamp-1">{child.title}</span>
                        </div>
                        <IssueStatusBadge status={child.status} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments Discussion Section */}
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
            <IssueComments
              comments={comments}
              currentUser={user}
              onAddComment={async (body) => {
                await issueService.addComment(issue.id, body);
                fetchIssueData();
              }}
              onUpdateComment={async (commentId, body) => {
                await issueService.updateComment(commentId, body);
                fetchIssueData();
              }}
              onDeleteComment={async (commentId) => {
                await issueService.deleteComment(commentId);
                fetchIssueData();
              }}
            />
          </div>
        </div>

        {/* Right Column Sidebar Metadata */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Metadata & Attributes
            </h3>

            {/* Reporter */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">Reporter</span>
              {issue.reporter ? (
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-slate-700 font-bold text-[10px] text-indigo-300 flex items-center justify-center">
                    {issue.reporter.name.charAt(0)}
                  </div>
                  <span>{issue.reporter.name}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500">System</span>
              )}
            </div>

            {/* Assignee */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">Assignee</span>
              {issue.assignee ? (
                <div className="flex items-center gap-2 text-xs text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-slate-700 font-bold text-[10px] text-indigo-300 flex items-center justify-center">
                    {issue.assignee.name.charAt(0)}
                  </div>
                  <span>{issue.assignee.name}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 italic">Unassigned</span>
              )}
            </div>

            {/* Labels Manager */}
            <div className="pt-2 border-t border-slate-800">
              <IssueLabelsManager
                attachedLabels={issue.labels || []}
                availableOrgLabels={orgLabels}
                onAttach={handleAttachLabel}
                onDetach={handleDetachLabel}
              />
            </div>

            {/* Dates */}
            <div className="pt-2 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" /> Created
                </span>
                <span className="text-slate-300">{new Date(issue.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> Updated
                </span>
                <span className="text-slate-300">{new Date(issue.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Issue Modal */}
      <IssueFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdateIssue}
        initialData={issue}
        members={members}
      />

      {/* Link Issue Modal */}
      <LinkIssueModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSubmit={handleCreateLink}
        projectIssues={projectIssues}
        currentIssueId={issue.id}
      />

      {/* Delete Confirmation Modal */}
      <DeleteIssueConfirmModal
        isOpen={deleteModalOpen}
        issueKey={issue.key}
        issueTitle={issue.title}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteIssue}
      />
    </div>
  );
};
