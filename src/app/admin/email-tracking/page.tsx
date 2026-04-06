"use client";

import { useEffect, useState } from "react";
import { Mail, Search, Filter, Download } from "lucide-react";
import { useToast } from "@/components/ToastProvider";

interface EmailRecord {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantName?: string;
  tenantId?: string;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export default function EmailTrackingPage() {
  const { toast } = useToast();
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadEmails();
  }, []);

  async function loadEmails() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/email-tracking");
      if (!response.ok) throw new Error("Falha ao carregar emails");
      const data = await response.json();
      setEmails(data.emails);
    } catch (error) {
      toast((error as Error).message || "Erro ao carregar emails", "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredEmails = emails.filter((record) => {
    const matchesSearch = record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesRole = filterRole === "all" || record.role === filterRole;
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "verified" && record.emailVerifiedAt) ||
      (filterStatus === "unverified" && !record.emailVerifiedAt) ||
      (filterStatus === "active" && record.isActive) ||
      (filterStatus === "inactive" && !record.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  function exportToCSV() {
    const headers = ["Email", "Nome", "Função", "Estabelecimento", "Verificado", "Ativo", "Criado"];
    const rows = filteredEmails.map((record) => [
      record.email,
      record.name,
      record.role,
      record.tenantName || "N/A",
      record.emailVerifiedAt ? "Sim" : "Não",
      record.isActive ? "Sim" : "Não",
      new Date(record.createdAt).toLocaleDateString("pt-BR"),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-tracking-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Rastreio de Emails
            </h1>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300">
            Acompanhe todos os emails na plataforma e identifique qual usuário/estabelecimento cada um pertence
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total de Emails</div>
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">{emails.length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Verificados</div>
            <div className="text-3xl font-bold text-green-600">{emails.filter((e) => e.emailVerifiedAt).length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Não Verificados</div>
            <div className="text-3xl font-bold text-amber-600">{emails.filter((e) => !e.emailVerifiedAt).length}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Ativos</div>
            <div className="text-3xl font-bold text-blue-600">{emails.filter((e) => e.isActive).length}</div>
          </div>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por email, nome ou estabelecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Funções</option>
              <option value="admin_geral">Admin Geral</option>
              <option value="tenant_admin">Admin de Estabelecimento</option>
              <option value="barbeiro">Barbeiro</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="verified">Email Verificado</option>
              <option value="unverified">Email Não Verificado</option>
              <option value="active">Usuário Ativo</option>
              <option value="inactive">Usuário Inativo</option>
            </select>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>

          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Mostrando {filteredEmails.length} de {emails.length} emails
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-zinc-500 dark:text-zinc-400">Carregando...</div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Mail className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                <div className="text-zinc-500 dark:text-zinc-400">Nenhum email encontrado</div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                      Função
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                      Estabelecimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                      Verificado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase">
                      Criado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {filteredEmails.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 dark:text-blue-400 break-all">
                        {record.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">{record.name}</td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.role === "admin_geral"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : record.role === "tenant_admin"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {record.role === "admin_geral"
                            ? "Admin Geral"
                            : record.role === "tenant_admin"
                            ? "Admin Est."
                            : "Barbeiro"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {record.tenantName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.emailVerifiedAt
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          }`}
                        >
                          {record.emailVerifiedAt ? "✓ Sim" : "✗ Não"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.isActive
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                        >
                          {record.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                        {new Date(record.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
