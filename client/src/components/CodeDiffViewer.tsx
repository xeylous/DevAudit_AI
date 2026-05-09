'use client';

import React, { useState } from 'react';
import { ReviewFile, Issue } from '@/types';
import SeverityBadge from './SeverityBadge';
import { ChevronDown, ChevronRight, FileCode, Copy, Check } from 'lucide-react';

interface CodeDiffViewerProps {
  files: ReviewFile[];
  issues: Issue[];
}

export default function CodeDiffViewer({ files, issues }: CodeDiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(files.map(f => f.filename)));
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleFile = (filename: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const getFileIssues = (filename: string) => {
    return issues.filter(i => i.file === filename);
  };

  const copyFix = async (fix: string) => {
    await navigator.clipboard.writeText(fix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderDiffLine = (line: string, lineNum: number, filename: string) => {
    const isAdd = line.startsWith('+');
    const isRemove = line.startsWith('-');
    const isHeader = line.startsWith('@@');
    const lineIssues = issues.filter(i => i.file === filename && i.line === lineNum);

    return (
      <div key={`${filename}-${lineNum}`} className="relative group">
        <div
          className={`diff-line flex items-stretch ${
            isAdd ? 'diff-add' : isRemove ? 'diff-remove' : isHeader ? 'bg-severity-medium/5 text-severity-medium' : ''
          }`}
        >
          <span className="w-12 flex-shrink-0 text-right pr-3 text-gh-muted select-none text-xs leading-6 border-r border-gh-border/50">
            {lineNum}
          </span>
          <span className="pl-3 flex-1 whitespace-pre-wrap">{line}</span>
          {lineIssues.length > 0 && (
            <button
              onClick={() => setSelectedIssue(lineIssues[0])}
              className="flex-shrink-0 px-2"
            >
              <SeverityBadge severity={lineIssues[0].severity} size="sm" />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <div className="bg-gh-surface border border-gh-border rounded-lg p-8 text-center">
        <FileCode size={40} className="mx-auto text-gh-muted mb-3" />
        <p className="text-gh-muted text-sm">No files to display yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => {
        const fileIssues = getFileIssues(file.filename);
        const isExpanded = expandedFiles.has(file.filename);

        return (
          <div key={file.filename} className="bg-gh-surface border border-gh-border rounded-lg overflow-hidden">
            {/* File header */}
            <button
              onClick={() => toggleFile(file.filename)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gh-bg/50 transition-colors text-left"
            >
              {isExpanded ? <ChevronDown size={16} className="text-gh-muted" /> : <ChevronRight size={16} className="text-gh-muted" />}
              <FileCode size={16} className="text-severity-medium" />
              <span className="text-sm font-mono text-gh-text flex-1 truncate">{file.filename}</span>
              <span className="text-xs text-severity-low">+{file.additions}</span>
              <span className="text-xs text-severity-critical">-{file.deletions}</span>
              {fileIssues.length > 0 && (
                <span className="text-xs bg-severity-high/15 text-severity-high px-2 py-0.5 rounded-full">
                  {fileIssues.length} issue{fileIssues.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>

            {/* Code content */}
            {isExpanded && (
              <div className="border-t border-gh-border overflow-x-auto">
                <div className="font-mono text-xs">
                  {file.chunks?.map((chunk) => {
                    const lines = chunk.code.split('\n');
                    return lines.map((line, idx) => 
                      renderDiffLine(line, chunk.lineStart + idx, file.filename)
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Issue detail popover */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedIssue(null)}>
          <div
            className="bg-gh-surface border border-gh-border rounded-xl max-w-lg w-full p-6 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gh-text">{selectedIssue.title}</h3>
                <p className="text-xs text-gh-muted mt-1">
                  {selectedIssue.file} • Line {selectedIssue.line}
                </p>
              </div>
              <SeverityBadge severity={selectedIssue.severity} />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gh-text mb-1">Explanation</h4>
                <p className="text-sm text-gh-muted">{selectedIssue.explanation}</p>
              </div>

              {selectedIssue.suggestedFix && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gh-text">Suggested Fix</h4>
                    <button
                      onClick={() => copyFix(selectedIssue.suggestedFix)}
                      className="flex items-center gap-1 text-xs text-gh-muted hover:text-gh-text transition-colors"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-gh-bg rounded-lg p-3 text-xs text-gh-text overflow-x-auto border border-gh-border">
                    {selectedIssue.suggestedFix}
                  </pre>
                </div>
              )}

              <button
                onClick={() => setSelectedIssue(null)}
                className="w-full py-2 bg-gh-border hover:bg-gh-muted/20 text-gh-text rounded-lg text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
