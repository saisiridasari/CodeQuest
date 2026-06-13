export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};

export const formatRuntime = (ms) => {
  if (!ms) return '0 ms';
  return `${(ms * 1000).toFixed(0)} ms`;
};

export const formatMemory = (kb) => {
  if (!kb) return '0 KB';
  if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
};

export const getDifficultyColor = (diff) => {
  switch (diff) {
    case 'Easy': return 'var(--easy)';
    case 'Medium': return 'var(--medium)';
    case 'Hard': return 'var(--hard)';
    default: return 'var(--text-muted)';
  }
};

export const getVerdictColor = (verdict) => {
  switch (verdict) {
    case 'Accepted': return 'var(--success)';
    case 'Wrong Answer': return 'var(--danger)';
    case 'Time Limit Exceeded': return 'var(--warning)';
    case 'Pending': return 'var(--text-muted)';
    default: return 'var(--danger)';
  }
};

export const calculateXPForLevel = (level) => (level - 1) * 100;
export const calculateXPProgress = (xp) => xp % 100;

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

export const getMonacoLanguage = (lang) => {
  const map = { javascript: 'javascript', python: 'python', cpp: 'cpp', java: 'java', c: 'c', typescript: 'typescript', go: 'go', rust: 'rust' };
  return map[lang] || 'plaintext';
};
