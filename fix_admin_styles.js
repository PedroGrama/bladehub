const fs = require('fs');

function replace(file, search, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.split(search).join(replacement);
  fs.writeFileSync(file, content, 'utf8');
}

// AdminTenantTable.tsx
const tFile = 'src/app/admin/AdminTenantTable.tsx';
replace(tFile, `border border-white/5 bg-white/3 backdrop-blur-xl p-8 shadow-2xl h-full`, `border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/3 backdrop-blur-xl p-8 shadow-xl dark:shadow-2xl h-full`);
replace(tFile, `bg-indigo-500/10 text-indigo-400`, `bg-indigo-500/10 text-indigo-600 dark:text-indigo-400`);
replace(tFile, `text-xl font-bold text-white`, `text-xl font-bold text-zinc-900 dark:text-white`);
replace(tFile, `border-b border-white/5`, `border-b border-zinc-200 dark:border-white/5`);
replace(tFile, `divide-y divide-white/5`, `divide-y divide-zinc-200 dark:divide-white/5`);
replace(tFile, `group hover:bg-white/5 transition-colors`, `group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors`);
replace(tFile, `font-semibold text-zinc-100 group-hover:text-white`, `font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-white`);
replace(tFile, `text-zinc-300 font-medium`, `text-zinc-700 dark:text-zinc-300 font-medium`);
replace(tFile, `border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition shadow-sm`, `border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition shadow-sm`);
replace(tFile, `text-blue-400 hover:text-blue-300 transition`, `text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition`);

// DashboardClient.tsx
const dFile = 'src/app/admin/DashboardClient.tsx';
replace(dFile, `text-3xl font-bold text-white tracking-tight`, `text-3xl font-bold text-zinc-900 dark:text-white tracking-tight`);
replace(dFile, `border border-white/5 bg-white/5 backdrop-blur-md px-4 py-2.5 text-sm text-zinc-300`, `border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/5 backdrop-blur-md px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-300`);
replace(dFile, `<option value="all" className="bg-zinc-900">`, `<option value="all" className="bg-white dark:bg-zinc-900">`);
replace(dFile, `<option value="active" className="bg-zinc-900">`, `<option value="active" className="bg-white dark:bg-zinc-900">`);
replace(dFile, `<option value="inactive" className="bg-zinc-900">`, `<option value="inactive" className="bg-white dark:bg-zinc-900">`);
replace(dFile, `border border-white/5 bg-white/3 backdrop-blur-xl p-8 shadow-2xl`, `border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/3 backdrop-blur-xl p-8 shadow-xl dark:shadow-2xl`);
replace(dFile, `text-lg font-bold text-white`, `text-lg font-bold text-zinc-900 dark:text-white`);
replace(dFile, `border border-white/5 bg-white/3 backdrop-blur-xl p-6 shadow-2xl`, `border border-zinc-200 dark:border-white/5 bg-white dark:bg-white/3 backdrop-blur-xl p-6 shadow-xl dark:shadow-2xl`);
replace(dFile, `text-sm font-bold text-zinc-400 uppercase`, `text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase`);
replace(dFile, `font-medium text-zinc-300`, `font-medium text-zinc-700 dark:text-zinc-300`);
replace(dFile, `rounded-xl bg-white/5 flex items-center`, `rounded-xl bg-zinc-50 dark:bg-white/5 flex items-center`);
replace(dFile, `text-zinc-500 group-hover:bg-blue-600/20 group-hover:text-blue-400`, `text-zinc-500 group-hover:bg-blue-500/10 dark:group-hover:bg-blue-600/20 group-hover:text-blue-600 dark:group-hover:text-blue-400`);
replace(dFile, `text-sm font-semibold text-zinc-200 group-hover:text-white`, `text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white`);
replace(dFile, `text-sm font-bold text-zinc-100 group-hover:text-blue-400`, `text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400`);
replace(dFile, `group hover:bg-white/5 transition-colors cursor-default`, `group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-default`);
replace(dFile, `text-2xl font-bold text-white group-hover:text-blue-400`, `text-2xl font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400`);

console.log('Fix applied!');
