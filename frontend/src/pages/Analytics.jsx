import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  CalendarDays,
  Users,
  QrCode,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import { getHostAnalytics } from "../api/event.api";

function formatShortDate(isoDate) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: "short",
    day: "2-digit",
  });
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="border border-gray-700 rounded-2xl p-6 bg-[#13131b]">
      <Icon className="text-violet-500 mb-4" size={28} />
      <h2 className="text-4xl font-bold">{value}</h2>
      <p className="uppercase tracking-widest text-gray-400 mt-2 text-sm">
        {label}
      </p>
    </div>
  );
}

const RANGE_OPTIONS = [
  { value: "1m", label: "1 Month" },
  { value: "3m", label: "3 Months" },
  { value: "all", label: "All Time" },
];

function Analytics() {
  const userData = useSelector((state) => state.auth.userData);

  const [range, setRange] = useState("3m");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userData) return;
    setLoading(true);
    getHostAnalytics(range)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || "Couldn't load analytics."))
      .finally(() => setLoading(false));
  }, [userData, range]);

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
        <p className="text-gray-400">Log in as a host to see your analytics.</p>
        <Link
          to="/login"
          className="bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        {error || "Something went wrong."}
      </div>
    );
  }

  const { overview, perEvent, registrationTrend } = data;

  const trendChartData = registrationTrend.map((point) => ({
    ...point,
    label: formatShortDate(point.date),
  }));

  const revenueChartData = perEvent
    .filter((event) => event.revenue > 0)
    .map((event) => ({
      title: event.title.length > 14 ? `${event.title.slice(0, 14)}…` : event.title,
      revenue: event.revenue,
    }));

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white px-12 py-10">
      <div className="mt-20 mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-violet-500 uppercase tracking-widest text-sm">
            Organizer
          </p>
          <h1 className="text-6xl font-bold mt-2">Analytics</h1>
          <p className="text-gray-400 mt-3">
            Attendance trends and revenue across all your events.
          </p>
        </div>

        <div className="flex gap-2 border border-gray-700 rounded-full p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition ${
                range === option.value
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {overview.totalEvents === 0 ? (
        <div className="border border-gray-700 rounded-2xl p-10 bg-[#13131b] text-center">
          <TrendingUp className="text-violet-500 mx-auto mb-4" size={32} />
          <p className="text-gray-400">
            {range === "all"
              ? "Publish your first event to start seeing analytics here."
              : "No events in this time range yet - try \"All Time\", or publish your first event."}
          </p>
          <Link
            to="/create"
            className="inline-block mt-6 bg-violet-600 hover:bg-violet-500 px-5 py-3 rounded-xl font-semibold"
          >
            Create an event
          </Link>
        </div>
      ) : (
        <>
          {/* Overview stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
            <StatCard icon={CalendarDays} label="Events" value={overview.totalEvents} />
            <StatCard
              icon={Users}
              label="Registrations"
              value={overview.totalRegistrations}
            />
            <StatCard
              icon={QrCode}
              label="Checked In"
              value={overview.totalCheckedIn}
            />
            <StatCard
              icon={TrendingUp}
              label="Attendance Rate"
              value={`${overview.overallAttendanceRate}%`}
            />
            <StatCard
              icon={IndianRupee}
              label="Total Revenue"
              value={`\u20B9${overview.totalRevenue.toLocaleString("en-IN")}`}
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="border border-gray-700 rounded-2xl bg-[#13131b] p-6">
              <h2 className="text-xl font-semibold mb-6">
                Registration Trend
              </h2>
              {trendChartData.length === 0 ? (
                <p className="text-gray-500 text-sm">No registrations yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                    <XAxis dataKey="label" stroke="#8b8b9a" fontSize={12} />
                    <YAxis stroke="#8b8b9a" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a25",
                        border: "1px solid #2a2a35",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Registrations"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="border border-gray-700 rounded-2xl bg-[#13131b] p-6">
              <h2 className="text-xl font-semibold mb-6">
                Revenue by Event
              </h2>
              {revenueChartData.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No paid-event revenue yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
                    <XAxis dataKey="title" stroke="#8b8b9a" fontSize={12} />
                    <YAxis stroke="#8b8b9a" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a25",
                        border: "1px solid #2a2a35",
                        borderRadius: 8,
                        color: "#fff",
                      }}
                      formatter={(value) => [`\u20B9${value}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Per-event breakdown */}
          <div className="border border-gray-700 rounded-2xl bg-[#13131b] p-8">
            <h2 className="text-2xl font-bold mb-6">Per-Event Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm uppercase tracking-widest border-b border-gray-800">
                    <th className="pb-3 pr-4">Event</th>
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Registered</th>
                    <th className="pb-3 pr-4">Checked In</th>
                    <th className="pb-3 pr-4">Attendance</th>
                    <th className="pb-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {perEvent.map((event) => (
                    <tr
                      key={event.eventId}
                      className="border-b border-gray-900 hover:bg-[#1a1a25]"
                    >
                      <td className="py-4 pr-4">
                        {event.archived ? (
                          <span className="font-semibold text-gray-300">
                            {event.title}
                            <span className="ml-2 text-[10px] uppercase tracking-widest text-gray-500 border border-gray-700 rounded px-1.5 py-0.5">
                              Past
                            </span>
                          </span>
                        ) : (
                          <Link
                            to={`/event/${event.eventId}`}
                            className="font-semibold hover:text-violet-400"
                          >
                            {event.title}
                          </Link>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-gray-400">
                        {formatShortDate(event.start)}
                      </td>
                      <td className="py-4 pr-4 text-gray-300">
                        {event.registrations}/{event.capacity}
                      </td>
                      <td className="py-4 pr-4 text-gray-300">
                        {event.checkedIn}
                      </td>
                      <td className="py-4 pr-4 text-gray-300">
                        {event.attendanceRate}%
                      </td>
                      <td className="py-4 text-violet-400 font-semibold">
                        {event.revenue > 0
                          ? `\u20B9${event.revenue.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
