import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Sparkles,
  Award,
  HeartHandshake,
  Layers,
  TrendingUp,
  Download,
  DollarSign,
  Users,
  FileText,
  CreditCard,
  Heart,
  Building2,
  CheckCircle2,
  Printer,
  Globe,
  ShieldCheck,
  Percent,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { SiteLayout } from "@/components/site/Layout";
import { useStoriesData } from "@/lib/stories-data";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "Enterprise Business Portal — India Story Project" },
      {
        name: "description",
        content:
          "Advertiser panels, brand campaigns, media kits, sponsorships, CSR dashboards, and member donations.",
      },
    ],
  }),
  component: AdvertisePage,
});

// Seed Initial Campaigns Data
const INITIAL_CAMPAIGNS = [
  {
    id: "c-1",
    brand: "Tata Sustainability",
    budget: 450000,
    impressions: 125000,
    clicks: 3800,
    ctr: 3.04,
    status: "Active",
    start: "2026-01-10",
    end: "2026-07-10",
  },
  {
    id: "c-2",
    brand: "Reliance Green Tech",
    budget: 600000,
    impressions: 180000,
    clicks: 4200,
    ctr: 2.33,
    status: "Active",
    start: "2026-02-15",
    end: "2026-08-15",
  },
  {
    id: "c-3",
    brand: "FabIndia Artisans Trust",
    budget: 250000,
    impressions: 95000,
    clicks: 3100,
    ctr: 3.26,
    status: "Completed",
    start: "2025-08-01",
    end: "2026-02-01",
  },
];

// Seed CSR & NGO Projects Data
const INITIAL_CSR_PROJECTS = [
  {
    id: "csr-1",
    name: "Himalayan Watershed Restoration",
    partner: "Green Rivers NGO",
    budget: 1200000,
    funded: 850000,
    state: "Uttarakhand",
    status: "Ongoing",
  },
  {
    id: "csr-2",
    name: "Rajasthan Solar Irrigation",
    partner: "Desert Tech Foundations",
    budget: 1800000,
    funded: 1800000,
    state: "Rajasthan",
    status: "Fully Funded",
  },
  {
    id: "csr-3",
    name: "Kashmir Loom Artisan Support",
    partner: "Valley Weavers NGO",
    budget: 900000,
    funded: 450000,
    state: "Jammu and Kashmir",
    status: "Ongoing",
  },
];

// Seed Invoices List
const INITIAL_INVOICES = [
  {
    id: "inv-1024",
    date: "2026-07-01",
    amount: 1500,
    description: "Patron Yearly Membership",
    status: "Paid",
    billing: "Pradhuman Dil",
  },
  {
    id: "inv-1025",
    date: "2026-07-05",
    amount: 450000,
    description: "Tata Sustainability Campaign Q3",
    status: "Paid",
    billing: "Tata Group Partnerships",
  },
  {
    id: "inv-1026",
    date: "2026-07-12",
    amount: 250,
    description: "One-time Supporter Donation",
    status: "Paid",
    billing: "Anonymous Supporter",
  },
];

function AdvertisePage() {
  const { stories: dbStories } = useStoriesData();

  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<"advertiser" | "csr" | "membership" | "mediakit">(
    "advertiser",
  );

  // State lists
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [csrProjects, setCsrProjects] = useState(INITIAL_CSR_PROJECTS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);

  // Form states
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "patron">("premium");
  const [billingName, setBillingName] = useState("");
  const [donationAmount, setDonationAmount] = useState("500");
  const [activeInvoice, setActiveInvoice] = useState<any>(null);

  // Brand CMS Form States
  const [newBrandName, setNewBrandName] = useState("");
  const [newBudget, setNewBudget] = useState("");

  // CSR Matching Form States
  const [newCsrName, setNewCsrName] = useState("");
  const [newCsrPartner, setNewCsrPartner] = useState("");
  const [newCsrBudget, setNewCsrBudget] = useState("");

  // Premium stories selector
  const premiumStories = useMemo(() => {
    return dbStories.slice(0, 4);
  }, [dbStories]);

  // Analytics datasets
  const visitorTrafficData = [
    { month: "Jan", visitors: 45000, views: 110000 },
    { month: "Feb", visitors: 52000, views: 135000 },
    { month: "Mar", visitors: 61000, views: 168000 },
    { month: "Apr", visitors: 78000, views: 198000 },
    { month: "May", visitors: 89000, views: 245000 },
    { month: "Jun", visitors: 110000, views: 320000 },
  ];

  const geographicalBreakdown = [
    { name: "Maharashtra", value: 35 },
    { name: "Delhi NCR", value: 25 },
    { name: "Karnataka", value: 15 },
    { name: "Tamil Nadu", value: 13 },
    { name: "Others", value: 12 },
  ];

  const COLORS = ["#C8A96A", "#e07a5f", "#81b29a", "#3d5a80", "#98c1d9"];

  // Campaign CMS submit handler
  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName || !newBudget) return;
    const parsedBudget = parseFloat(newBudget);
    const newCamp = {
      id: `c-${campaigns.length + 1}`,
      brand: newBrandName,
      budget: parsedBudget,
      impressions: 0,
      clicks: 0,
      ctr: 0.0,
      status: "Active",
      start: new Date().toISOString().split("T")[0],
      end: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    };
    setCampaigns([newCamp, ...campaigns]);

    // Also generate an invoice for this campaign
    const newInv = {
      id: `inv-${1027 + invoices.length}`,
      date: new Date().toISOString().split("T")[0],
      amount: parsedBudget,
      description: `${newBrandName} Campaign Activation`,
      status: "Unpaid",
      billing: `${newBrandName} Finance Desk`,
    };
    setInvoices([newInv, ...invoices]);

    setNewBrandName("");
    setNewBudget("");
  };

  // CSR Project Matching submit handler
  const handleCreateCsrProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCsrName || !newCsrPartner || !newCsrBudget) return;
    const newProject = {
      id: `csr-${csrProjects.length + 1}`,
      name: newCsrName,
      partner: newCsrPartner,
      budget: parseFloat(newCsrBudget),
      funded: 0,
      state: "Maharashtra",
      status: "Ongoing",
    };
    setCsrProjects([newProject, ...csrProjects]);
    setNewCsrName("");
    setNewCsrPartner("");
    setNewCsrBudget("");
  };

  // Membership upgrade handler
  const handleUpgradeMembership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billingName) return;
    const price = selectedPlan === "basic" ? 199 : selectedPlan === "premium" ? 499 : 1499;
    const newInv = {
      id: `inv-${1027 + invoices.length}`,
      date: new Date().toISOString().split("T")[0],
      amount: price,
      description: `${selectedPlan.toUpperCase()} Monthly Subscription Upgrade`,
      status: "Paid",
      billing: billingName,
    };
    setInvoices([newInv, ...invoices]);
    setIsSubscribed(true);
    setActiveInvoice(newInv);
  };

  // Donation handler
  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0) return;
    const newInv = {
      id: `inv-${1027 + invoices.length}`,
      date: new Date().toISOString().split("T")[0],
      amount,
      description: "One-time Supporter Donation",
      status: "Paid",
      billing: billingName || "Anonymous Supporter",
    };
    setInvoices([newInv, ...invoices]);
    setActiveInvoice(newInv);
    alert(`Thank you for donating ₹${amount}! Receipt invoice generated.`);
  };

  return (
    <SiteLayout>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a0a0a",
          color: "white",
          padding: "40px 24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header Title */}
          <div
            style={{
              marginBottom: "40px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#C8A96A",
                marginBottom: "4px",
              }}
            >
              <Megaphone size={18} />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                }}
              >
                Enterprise Business Hub
              </span>
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: 700, fontFamily: "serif", margin: 0 }}>
              India Story Partner &amp; Member Console
            </h1>
            <p style={{ color: "#a0a0a0", fontSize: "14px", marginTop: "6px", maxWidth: "680px" }}>
              Coordinate corporate sponsorships, launch native brand campaigns, matches impact
              investments with NGOs, manage reader subscriptions, and track real-time analytics.
            </p>
          </div>

          {/* Quick Metrics Dashboard Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                backgroundColor: "#141414",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#808080",
                  textTransform: "uppercase",
                  display: "block",
                }}
              >
                Views &amp; Impressions
              </span>
              <span
                style={{ fontSize: "24px", fontWeight: 700, display: "block", marginTop: "4px" }}
              >
                400,000+
              </span>
              <span style={{ fontSize: "11px", color: "#81b29a", fontWeight: 600 }}>
                +24% vs last month
              </span>
            </div>
            <div
              style={{
                backgroundColor: "#141414",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#808080",
                  textTransform: "uppercase",
                  display: "block",
                }}
              >
                Sponsorship Funds
              </span>
              <span
                style={{ fontSize: "24px", fontWeight: 700, display: "block", marginTop: "4px" }}
              >
                ₹3,100,000
              </span>
              <span style={{ fontSize: "11px", color: "#C8A96A", fontWeight: 600 }}>
                Matched to 3 key NGO programs
              </span>
            </div>
            <div
              style={{
                backgroundColor: "#141414",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#808080",
                  textTransform: "uppercase",
                  display: "block",
                }}
              >
                Active Campaigns
              </span>
              <span
                style={{ fontSize: "24px", fontWeight: 700, display: "block", marginTop: "4px" }}
              >
                {campaigns.filter((c) => c.status === "Active").length} Campaigns
              </span>
              <span style={{ fontSize: "11px", color: "#a0a0a0" }}>Average CTR: 2.87%</span>
            </div>
            <div
              style={{
                backgroundColor: "#141414",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#808080",
                  textTransform: "uppercase",
                  display: "block",
                }}
              >
                Premium Subscribers
              </span>
              <span
                style={{ fontSize: "24px", fontWeight: 700, display: "block", marginTop: "4px" }}
              >
                1,450 Readers
              </span>
              <span style={{ fontSize: "11px", color: "#81b29a", fontWeight: 600 }}>
                +12% monthly growth
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <button
              onClick={() => setActiveTab("advertiser")}
              style={{
                paddingBottom: "12px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: activeTab === "advertiser" ? "#C8A96A" : "#a0a0a0",
                borderBottom:
                  activeTab === "advertiser" ? "2px solid #C8A96A" : "2px solid transparent",
              }}
            >
              Advertiser &amp; Campaign CMS
            </button>
            <button
              onClick={() => setActiveTab("csr")}
              style={{
                paddingBottom: "12px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: activeTab === "csr" ? "#C8A96A" : "#a0a0a0",
                borderBottom: activeTab === "csr" ? "2px solid #C8A96A" : "2px solid transparent",
              }}
            >
              NGO &amp; CSR Dashboard
            </button>
            <button
              onClick={() => setActiveTab("membership")}
              style={{
                paddingBottom: "12px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: activeTab === "membership" ? "#C8A96A" : "#a0a0a0",
                borderBottom:
                  activeTab === "membership" ? "2px solid #C8A96A" : "2px solid transparent",
              }}
            >
              Membership, Donations &amp; Invoices
            </button>
            <button
              onClick={() => setActiveTab("mediakit")}
              style={{
                paddingBottom: "12px",
                fontSize: "14px",
                fontWeight: 600,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: activeTab === "mediakit" ? "#C8A96A" : "#a0a0a0",
                borderBottom:
                  activeTab === "mediakit" ? "2px solid #C8A96A" : "2px solid transparent",
              }}
            >
              Media Kit &amp; Demographics
            </button>
          </div>

          {/* Tab Views Panel */}
          <div>
            {/* 1. ADVERTISER PANEL & BRAND CAMPAIGN CMS */}
            {activeTab === "advertiser" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "window.innerWidth > 900 ? '1fr 340px' : '1fr'",
                  gap: "32px",
                }}
                className="grid lg:grid-cols-[1fr_340px]"
              >
                {/* Active Campaigns Table */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        margin: "0 0 16px 0",
                        color: "#C8A96A",
                      }}
                    >
                      Active Campaigns Performance
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              color: "#808080",
                              textAlign: "left",
                            }}
                          >
                            <th style={{ padding: "10px 8px" }}>Brand Partner</th>
                            <th style={{ padding: "10px 8px" }}>Budget</th>
                            <th style={{ padding: "10px 8px" }}>Impressions</th>
                            <th style={{ padding: "10px 8px" }}>Clicks</th>
                            <th style={{ padding: "10px 8px" }}>CTR</th>
                            <th style={{ padding: "10px 8px" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campaigns.map((camp) => (
                            <tr
                              key={camp.id}
                              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                              className="hover:bg-white/5 transition-colors"
                            >
                              <td style={{ padding: "12px 8px", fontWeight: 600 }}>{camp.brand}</td>
                              <td style={{ padding: "12px 8px" }}>
                                ₹{camp.budget.toLocaleString()}
                              </td>
                              <td style={{ padding: "12px 8px" }}>
                                {camp.impressions.toLocaleString()}
                              </td>
                              <td style={{ padding: "12px 8px" }}>
                                {camp.clicks.toLocaleString()}
                              </td>
                              <td
                                style={{ padding: "12px 8px", color: "#C8A96A", fontWeight: 600 }}
                              >
                                {camp.ctr}%
                              </td>
                              <td style={{ padding: "12px 8px" }}>
                                <span
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    backgroundColor:
                                      camp.status === "Active"
                                        ? "rgba(129, 178, 154, 0.1)"
                                        : "rgba(255,255,255,0.05)",
                                    color: camp.status === "Active" ? "#81b29a" : "#808080",
                                  }}
                                >
                                  {camp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Monthly Campaigns CTR Progression Area Chart */}
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        margin: "0 0 16px 0",
                        color: "#C8A96A",
                      }}
                    >
                      Aggregate Campaigns Performance CTR Trends
                    </h3>
                    <div style={{ height: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={visitorTrafficData}>
                          <XAxis dataKey="month" stroke="#606060" fontSize={11} />
                          <YAxis stroke="#606060" fontSize={11} />
                          <ChartTooltip
                            contentStyle={{
                              backgroundColor: "#141414",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="views"
                            stroke="#C8A96A"
                            fill="rgba(200, 169, 106, 0.15)"
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Brand Campaign CMS Side-Card Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#C8A96A",
                        marginBottom: "16px",
                      }}
                    >
                      <Building2 size={16} />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Brand Campaign CMS
                      </span>
                    </div>
                    <form
                      onSubmit={handleCreateCampaign}
                      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#808080",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          Brand Partner Name
                        </label>
                        <input
                          type="text"
                          required
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          placeholder="e.g. Tata Motors Green"
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#808080",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          Allocated Budget (INR)
                        </label>
                        <input
                          type="number"
                          required
                          value={newBudget}
                          onChange={(e) => setNewBudget(e.target.value)}
                          placeholder="500000"
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#C8A96A",
                          color: "black",
                          fontWeight: 600,
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px",
                          cursor: "pointer",
                          marginTop: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          fontSize: "13px",
                        }}
                      >
                        <Plus size={14} />
                        Activate Brand Campaign
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* 2. NGO & CSR DASHBOARD */}
            {activeTab === "csr" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "window.innerWidth > 900 ? '1fr 340px' : '1fr'",
                  gap: "32px",
                }}
                className="grid lg:grid-cols-[1fr_340px]"
              >
                {/* Active Projects matched */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        margin: "0 0 16px 0",
                        color: "#C8A96A",
                      }}
                    >
                      NGO Program Allocations (CSR Matching)
                    </h3>
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
                      >
                        <thead>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(255,255,255,0.08)",
                              color: "#808080",
                              textAlign: "left",
                            }}
                          >
                            <th style={{ padding: "10px 8px" }}>CSR Program</th>
                            <th style={{ padding: "10px 8px" }}>NGO Partner</th>
                            <th style={{ padding: "10px 8px" }}>Target</th>
                            <th style={{ padding: "10px 8px" }}>Funded</th>
                            <th style={{ padding: "10px 8px" }}>State</th>
                            <th style={{ padding: "10px 8px" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csrProjects.map((p) => (
                            <tr
                              key={p.id}
                              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                            >
                              <td style={{ padding: "12px 8px", fontWeight: 600 }}>{p.name}</td>
                              <td style={{ padding: "12px 8px" }}>{p.partner}</td>
                              <td style={{ padding: "12px 8px" }}>₹{p.budget.toLocaleString()}</td>
                              <td style={{ padding: "12px 8px", color: "#81b29a" }}>
                                ₹{p.funded.toLocaleString()}
                              </td>
                              <td style={{ padding: "12px 8px" }}>{p.state}</td>
                              <td style={{ padding: "12px 8px" }}>
                                <span
                                  style={{
                                    fontSize: "10px",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontWeight: 600,
                                    backgroundColor:
                                      p.status === "Fully Funded"
                                        ? "rgba(129, 178, 154, 0.1)"
                                        : "rgba(200, 169, 106, 0.1)",
                                    color: p.status === "Fully Funded" ? "#81b29a" : "#C8A96A",
                                  }}
                                >
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Match CSR NGO Form */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#C8A96A",
                        marginBottom: "16px",
                      }}
                    >
                      <Building2 size={16} />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        CSR Match Center
                      </span>
                    </div>
                    <form
                      onSubmit={handleCreateCsrProject}
                      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#808080",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          CSR Program Title
                        </label>
                        <input
                          type="text"
                          required
                          value={newCsrName}
                          onChange={(e) => setNewCsrName(e.target.value)}
                          placeholder="e.g. Village Sanitation Project"
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#808080",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          NGO Associate Partner
                        </label>
                        <input
                          type="text"
                          required
                          value={newCsrPartner}
                          onChange={(e) => setNewCsrPartner(e.target.value)}
                          placeholder="e.g. Rural Water Alliance"
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#808080",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          Funding Requirement (INR)
                        </label>
                        <input
                          type="number"
                          required
                          value={newCsrBudget}
                          onChange={(e) => setNewCsrBudget(e.target.value)}
                          placeholder="1000000"
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#C8A96A",
                          color: "black",
                          fontWeight: 600,
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px",
                          cursor: "pointer",
                          marginTop: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          fontSize: "13px",
                        }}
                      >
                        <Plus size={14} />
                        Establish CSR Match
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* 3. MEMBERSHIP, DONATIONS & INVOICES */}
            {activeTab === "membership" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "window.innerWidth > 900 ? '1fr 340px' : '1fr'",
                  gap: "32px",
                }}
                className="grid lg:grid-cols-[1fr_340px]"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                  {/* Select Membership Plan */}
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        margin: "0 0 16px 0",
                        color: "#C8A96A",
                      }}
                    >
                      Subscription Tiers &amp; Plans
                    </h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "16px",
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        onClick={() => setSelectedPlan("basic")}
                        style={{
                          padding: "16px",
                          borderRadius: "8px",
                          backgroundColor:
                            selectedPlan === "basic"
                              ? "rgba(200, 169, 106, 0.1)"
                              : "rgba(255,255,255,0.02)",
                          border:
                            selectedPlan === "basic"
                              ? "1px solid #C8A96A"
                              : "1px solid rgba(255,255,255,0.08)",
                          cursor: "pointer",
                        }}
                      >
                        <h4 style={{ margin: 0, fontWeight: 700 }}>Basic Supporter</h4>
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            display: "block",
                            margin: "8px 0",
                          }}
                        >
                          ₹199<span style={{ fontSize: "11px", color: "#808080" }}>/mo</span>
                        </span>
                        <p style={{ fontSize: "11px", color: "#a0a0a0", margin: 0 }}>
                          Ad-free Reading, 1 Free Audio Download per month.
                        </p>
                      </div>

                      <div
                        onClick={() => setSelectedPlan("premium")}
                        style={{
                          padding: "16px",
                          borderRadius: "8px",
                          backgroundColor:
                            selectedPlan === "premium"
                              ? "rgba(200, 169, 106, 0.1)"
                              : "rgba(255,255,255,0.02)",
                          border:
                            selectedPlan === "premium"
                              ? "1px solid #C8A96A"
                              : "1px solid rgba(255,255,255,0.08)",
                          cursor: "pointer",
                        }}
                      >
                        <h4 style={{ margin: 0, fontWeight: 700 }}>Premium Reader</h4>
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            display: "block",
                            margin: "8px 0",
                          }}
                        >
                          ₹499<span style={{ fontSize: "11px", color: "#808080" }}>/mo</span>
                        </span>
                        <p style={{ fontSize: "11px", color: "#a0a0a0", margin: 0 }}>
                          Access all Premium Stories, Unlimited TTS Audio Downloads.
                        </p>
                      </div>

                      <div
                        onClick={() => setSelectedPlan("patron")}
                        style={{
                          padding: "16px",
                          borderRadius: "8px",
                          backgroundColor:
                            selectedPlan === "patron"
                              ? "rgba(200, 169, 106, 0.1)"
                              : "rgba(255,255,255,0.02)",
                          border:
                            selectedPlan === "patron"
                              ? "1px solid #C8A96A"
                              : "1px solid rgba(255,255,255,0.08)",
                          cursor: "pointer",
                        }}
                      >
                        <h4 style={{ margin: 0, fontWeight: 700 }}>Patron member</h4>
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: 700,
                            display: "block",
                            margin: "8px 0",
                          }}
                        >
                          ₹1,499<span style={{ fontSize: "11px", color: "#808080" }}>/mo</span>
                        </span>
                        <p style={{ fontSize: "11px", color: "#a0a0a0", margin: 0 }}>
                          Co-fund 1 writer dispatch, physical print dispatches yearly.
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleUpgradeMembership}
                      style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}
                    >
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#808080",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          Billing Name
                        </label>
                        <input
                          type="text"
                          required
                          value={billingName}
                          onChange={(e) => setBillingName(e.target.value)}
                          placeholder="e.g. Pradhuman Dil"
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#C8A96A",
                          color: "black",
                          fontWeight: 600,
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px 20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "13px",
                          height: "36px",
                        }}
                      >
                        <CreditCard size={14} />
                        Join Membership
                      </button>
                    </form>
                  </div>

                  {/* Dynamic Premium Stories Unlocks */}
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        margin: "0 0 8px 0",
                        color: "#C8A96A",
                      }}
                    >
                      Premium Stories Archive
                    </h3>
                    <p style={{ fontSize: "12px", color: "#808080", margin: "0 0 16px 0" }}>
                      {isSubscribed
                        ? "🎉 Your Premium Membership is active! Enjoy full access."
                        : "🔒 Unlock these slow-journalism dispatches with a supporter subscription."}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {premiumStories.map((story) => (
                        <div
                          key={story.id}
                          style={{
                            display: "flex",
                            gap: "12px",
                            padding: "12px",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {story.image && (
                            <img
                              src={story.image}
                              alt={story.title}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <span
                              style={{
                                fontSize: "9px",
                                color: "#C8A96A",
                                textTransform: "uppercase",
                              }}
                            >
                              Premium Dispatch
                            </span>
                            <h4
                              style={{
                                fontSize: "13px",
                                margin: "4px 0",
                                fontWeight: 600,
                                textOverflow: "ellipsis",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {story.title}
                            </h4>
                            <span style={{ fontSize: "11px", color: "#808080" }}>
                              {story.readTime || "4 min read"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Donation and Invoices List side-panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Donation Form */}
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#C8A96A",
                        marginBottom: "16px",
                      }}
                    >
                      <Heart size={16} />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}
                      >
                        Support Free Press
                      </span>
                    </div>
                    <form
                      onSubmit={handleDonate}
                      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#808080",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          One-time Contribution (INR)
                        </label>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                          {["250", "500", "1000", "5000"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setDonationAmount(preset)}
                              style={{
                                flex: 1,
                                padding: "6px",
                                fontSize: "12px",
                                borderRadius: "4px",
                                border:
                                  donationAmount === preset
                                    ? "1px solid #C8A96A"
                                    : "1px solid rgba(255,255,255,0.08)",
                                backgroundColor:
                                  donationAmount === preset
                                    ? "rgba(200,169,106,0.1)"
                                    : "rgba(255,255,255,0.02)",
                                color: "white",
                                cursor: "pointer",
                              }}
                            >
                              ₹{preset}
                            </button>
                          ))}
                        </div>
                        <input
                          type="number"
                          required
                          value={donationAmount}
                          onChange={(e) => setDonationAmount(e.target.value)}
                          placeholder="Contribution amount"
                          style={{
                            width: "100%",
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: "6px",
                            padding: "8px 10px",
                            color: "white",
                            fontSize: "13px",
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: "#C8A96A",
                          color: "black",
                          fontWeight: 600,
                          border: "none",
                          borderRadius: "6px",
                          padding: "10px",
                          cursor: "pointer",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Heart size={14} />
                        Fund Dispatches
                      </button>
                    </form>
                  </div>

                  {/* Generated Invoice list */}
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "#C8A96A",
                        marginBottom: "12px",
                      }}
                    >
                      Invoices &amp; Receipts
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {invoices.map((inv) => (
                        <div
                          key={inv.id}
                          onClick={() => setActiveInvoice(inv)}
                          style={{
                            padding: "10px",
                            backgroundColor: "rgba(255,255,255,0.02)",
                            borderRadius: "6px",
                            border: "1px solid rgba(255,255,255,0.06)",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <span style={{ fontSize: "11px", color: "#808080" }}>
                              {inv.id} • {inv.date}
                            </span>
                            <h4 style={{ fontSize: "12px", fontWeight: 600, margin: "2px 0 0 0" }}>
                              {inv.description}
                            </h4>
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#C8A96A" }}>
                            ₹{inv.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. MEDIA KIT & DEMOGRAPHICS */}
            {activeTab === "mediakit" && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "window.innerWidth > 900 ? '1fr 340px' : '1fr'",
                  gap: "32px",
                }}
                className="grid lg:grid-cols-[1fr_340px]"
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Geographical Pie Chart & Demographics */}
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        margin: "0 0 16px 0",
                        color: "#C8A96A",
                      }}
                    >
                      Geographical Reader Distribution
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "32px",
                      }}
                    >
                      <div style={{ width: "160px", height: "160px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={geographicalBreakdown}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {geographicalBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div
                        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}
                      >
                        {geographicalBreakdown.map((item, index) => (
                          <div
                            key={item.name}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div
                                style={{
                                  width: "10px",
                                  height: "10px",
                                  borderRadius: "50%",
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              />
                              <span>{item.name}</span>
                            </div>
                            <span style={{ fontWeight: 700 }}>{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Media Kit PDF Downloads */}
                  <div
                    style={{
                      backgroundColor: "#141414",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                      padding: "24px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#C8A96A",
                        marginBottom: "16px",
                      }}
                    >
                      Download Assets
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div
                        style={{
                          padding: "12px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                        }}
                      >
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 600 }}>
                          Brand Identity Kit
                        </h4>
                        <span style={{ fontSize: "11px", color: "#808080" }}>
                          SVGs, Logos, Palettes (4.2MB)
                        </span>
                        <button
                          style={{
                            width: "100%",
                            border: "none",
                            backgroundColor: "#C8A96A",
                            color: "black",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "8px",
                            borderRadius: "4px",
                            marginTop: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Download size={12} />
                          DOWNLOAD ZIP
                        </button>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                        }}
                      >
                        <h4 style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 600 }}>
                          readership stats sheet
                        </h4>
                        <span style={{ fontSize: "11px", color: "#808080" }}>
                          Geographics, Engagement Index (PDF)
                        </span>
                        <button
                          style={{
                            width: "100%",
                            border: "none",
                            backgroundColor: "#C8A96A",
                            color: "black",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "8px",
                            borderRadius: "4px",
                            marginTop: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Download size={12} />
                          DOWNLOAD PDF
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ────────────────── FLOATING PRINTABLE INVOICE MODAL ────────────────── */}
      <AnimatePresence>
        {activeInvoice && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "24px",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: "white",
                color: "black",
                width: "100%",
                maxWidth: "600px",
                borderRadius: "16px",
                padding: "32px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                fontFamily: "sans-serif",
              }}
            >
              {/* Invoice Printable Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "2px solid #eaeaea",
                  paddingBottom: "20px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h2
                    style={{ margin: 0, fontFamily: "serif", fontSize: "24px", color: "#b89047" }}
                  >
                    India Story Project
                  </h2>
                  <span style={{ fontSize: "12px", color: "#666" }}>
                    Empowering Slow Journalism &amp; Community Voices
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <h3 style={{ margin: 0, fontSize: "18px" }}>INVOICE</h3>
                  <span style={{ fontSize: "12px", color: "#666" }}>Ref: {activeInvoice.id}</span>
                </div>
              </div>

              {/* Billing Info */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  marginBottom: "24px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#888",
                      fontWeight: 600,
                      fontSize: "11px",
                      textTransform: "uppercase",
                    }}
                  >
                    Billed To:
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      display: "block",
                      marginTop: "4px",
                    }}
                  >
                    {activeInvoice.billing}
                  </span>
                  <span style={{ color: "#666" }}>Official Partner Agency / Supporter Profile</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    style={{
                      display: "block",
                      color: "#888",
                      fontWeight: 600,
                      fontSize: "11px",
                      textTransform: "uppercase",
                    }}
                  >
                    Invoice Details:
                  </span>
                  <span style={{ display: "block", marginTop: "4px" }}>
                    <strong>Date:</strong> {activeInvoice.date}
                  </span>
                  <span style={{ display: "block" }}>
                    <strong>Status:</strong> {activeInvoice.status}
                  </span>
                </div>
              </div>

              {/* Invoice Item Table */}
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  marginBottom: "24px",
                }}
              >
                <thead>
                  <tr
                    style={{ borderBottom: "2px solid #eaeaea", textAlign: "left", color: "#666" }}
                  >
                    <th style={{ padding: "8px 0" }}>Description</th>
                    <th style={{ padding: "8px 0", textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px 0", fontWeight: 600 }}>
                      {activeInvoice.description}
                    </td>
                    <td style={{ padding: "12px 0", textAlign: "right", fontWeight: 700 }}>
                      ₹{activeInvoice.amount.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "12px 0", fontWeight: 700, textTransform: "uppercase" }}>
                      Total Paid
                    </td>
                    <td
                      style={{
                        padding: "12px 0",
                        textAlign: "right",
                        fontWeight: 800,
                        fontSize: "16px",
                        color: "#b89047",
                      }}
                    >
                      ₹{activeInvoice.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Bottom Actions */}
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <button
                  onClick={() => window.print()}
                  style={{
                    backgroundColor: "#eaeaea",
                    color: "black",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Printer size={14} />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Close Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}
