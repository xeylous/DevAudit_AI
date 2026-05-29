'use client';

import React, { useState } from 'react';
import { ReviewFile, Issue } from '@/types';
import SeverityBadge from './SeverityBadge';
import { ChevronDown, ChevronRight, FileCode, Copy, Check, X } from 'lucide-react';

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
          <span className="w-12 flex-shrink-0 text-right pr-3 text-gh-muted/50 select-none text-xs leading-7 border-r border-gh-border/30 font-mono">
            {lineNum}
          </span>
          <span className="pl-3 flex-1 whitespace-pre-wrap">{line}</span>
          {lineIssues.length > 0 && (
            <button
              onClick={() => setSelectedIssue(lineIssues[0])}
              className="flex-shrink-0 px-2 opacity-80 hover:opacity-100 transition-opacity"
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
      <div className="bg-gh-surface border border-gh-border rounded-xl p-8 text-center">
        <FileCode size={40} className="mx-auto text-gh-muted mb-3 animate-float" />
        <p className="text-gh-muted text-sm font-medium">No files to display yet</p>
        <p className="text-xs text-gh-muted/60 mt-1">Files will appear as the agent processes them</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file, fileIndex) => {
        const fileIssues = getFileIssues(file.filename);
        const isExpanded = expandedFiles.has(file.filename);

        return (
          <div
            key={file.filename}
            className="bg-gh-surface border border-gh-border rounded-xl overflow-hidden"
            style={{
              animation: 'staggerFadeInUp 0.4s ease forwards',
              animationDelay: `${fileIndex * 0.08}s`,
            }}
          >
            {/* File header */}
            <button
              onClick={() => toggleFile(file.filename)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gh-bg/50 transition-all duration-200 text-left group"
            >
              <span className="transition-transform duration-200">
                {isExpanded ? <ChevronDown size={16} className="text-gh-muted" /> : <ChevronRight size={16} className="text-gh-muted" />}
              </span>
              <FileCode size={16} className="text-severity-medium flex-shrink-0" />
              <span className="text-sm font-mono text-gh-text flex-1 truncate group-hover:text-gh-accent transition-colors">{file.filename}</span>
              <span className="text-xs text-severity-low font-mono">+{file.additions}</span>
              <span className="text-xs text-severity-critical font-mono">-{file.deletions}</span>
              {fileIssues.length > 0 && (
                <span className="text-xs bg-severity-high/15 text-severity-high px-2.5 py-0.5 rounded-full font-medium">
                  {fileIssues.length} issue{fileIssues.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>

            {/* Code content - with smooth collapse */}
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: isExpanded ? '2000px' : '0',
                opacity: isExpanded ? 1 : 0,
              }}
            >
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
            </div>
          </div>
        );
      })}

      {/* Issue detail modal */}
      {selectedIssue && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={() => setSelectedIssue(null)}
        >
          <div
            className="bg-gh-surface border border-gh-border rounded-2xl max-w-lg w-full p-6 modal-content shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gh-text">{selectedIssue.title}</h3>
                <p className="text-xs text-gh-muted mt-1 font-mono">
                  {selectedIssue.file} • Line {selectedIssue.line}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SeverityBadge severity={selectedIssue.severity} />
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1 hover:bg-gh-border rounded-lg transition-colors text-gh-muted hover:text-gh-text"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gh-text mb-1.5">Explanation</h4>
                <p className="text-sm text-gh-muted leading-relaxed">{selectedIssue.explanation}</p>
              </div>

              {selectedIssue.suggestedFix && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-medium text-gh-text">Suggested Fix</h4>
                    <button
                      onClick={() => copyFix(selectedIssue.suggestedFix)}
                      className="flex items-center gap-1 text-xs text-gh-muted hover:text-gh-accent transition-colors px-2 py-1 rounded-lg hover:bg-gh-bg"
                    >
                      {copied ? <Check size={12} className="text-severity-low" /> : <Copy size={12} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="bg-gh-bg rounded-lg p-3 text-xs text-gh-text overflow-x-auto border border-gh-border font-mono leading-relaxed">
                    {selectedIssue.suggestedFix}
                  </pre>
                </div>
              )}

              <button
                onClick={() => setSelectedIssue(null)}
                className="w-full py-2.5 bg-gh-bg hover:bg-gh-border/50 text-gh-text rounded-xl text-sm font-medium transition-all duration-200 border border-gh-border active:scale-[0.98]"
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
