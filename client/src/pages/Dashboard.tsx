import { Calendar, DollarSign, Users, UserCheck, Wrench, Zap, Car, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardStats, recentBookings, topProviders } from "@/data/dummyData";

const statsCards = [
  {
    title: "Total Bookings",
    value: dashboardStats.totalBookings.toLocaleString(),
    change: "+12%",
    changeType: "positive",
    icon: Calendar,
    iconBg: "bg-primary bg-opacity-10",
    iconColor: "text-primary",
  },
  {
    title: "Total Revenue",
    value: `$${dashboardStats.totalRevenue.toLocaleString()}`,
    change: "+8.2%",
    changeType: "positive",
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Active Providers",
    value: dashboardStats.activeProviders.toString(),
    change: "+4",
    changeType: "positive",
    icon: Users,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Total Customers",
    value: dashboardStats.totalCustomers.toLocaleString(),
    change: "+15%",
    changeType: "positive",
    icon: UserCheck,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
];

const serviceIcons = {
  wrench: Wrench,
  zap: Zap,
  car: Car,
};

const statusColors = {
  completed: "bg-green-100 text-green-800",
  "in-progress": "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">{stat.title}</dt>
                      <dd className="text-base sm:text-lg font-medium text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-green-600 font-medium">{stat.change}</span>
                  <span className="text-gray-500"> from last month</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Recent Bookings */}
        <Card className="shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Bookings</h3>
          </div>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentBookings.map((booking) => {
                const IconComponent = serviceIcons[booking.icon as keyof typeof serviceIcons];
                return (
                  <div key={booking.id} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{booking.service}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{booking.customer}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]} ml-2 flex-shrink-0`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Providers */}
        <Card className="shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">Top Performing Providers</h3>
          </div>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {topProviders.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${provider.bgColor} text-white flex items-center justify-center text-xs sm:text-sm font-medium`}>
                        {provider.initials}
                      </div>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{provider.name}</p>
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
                          <span className="text-xs sm:text-sm text-gray-500 ml-1">{provider.rating}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500 ml-2 hidden sm:inline">{provider.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">${provider.earnings.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-gray-500">this month</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
