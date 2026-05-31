import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BarChart3, Image, MessageSquare, Users, TrendingUp } from 'lucide-react';
import { NotificationsPanel } from '@/components/NotificationsPanel';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalCollections: 0,
    pendingReviews: 0,
    totalContacts: 0,
  });

  // Check if user is authenticated as admin
  useEffect(() => {
    const isAdminAuth = localStorage.getItem('adminAuth');
    if (!isAdminAuth) {
      setLocation('/admin-login');
    }
  }, [setLocation]);

  const artworksQuery = trpc.artworks.list.useQuery();
  const collectionsQuery = trpc.collections.list.useQuery();
  const contactsQuery = trpc.contact.list.useQuery();
  const reviewsQuery = trpc.reviews.list.useQuery();

  useEffect(() => {
    if (artworksQuery.data && collectionsQuery.data && contactsQuery.data && reviewsQuery.data) {
      setStats({
        totalArtworks: artworksQuery.data.length,
        totalCollections: collectionsQuery.data.length,
        pendingReviews: reviewsQuery.data.length,
        totalContacts: contactsQuery.data.length,
      });
    }
  }, [artworksQuery.data, collectionsQuery.data, contactsQuery.data, reviewsQuery.data]);



  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="p-6 bg-card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Admin</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Image}
            label="Total Artworks"
            value={stats.totalArtworks}
            color="bg-blue-500"
          />
          <StatCard
            icon={BarChart3}
            label="Collections"
            value={stats.totalCollections}
            color="bg-green-500"
          />
          <StatCard
            icon={MessageSquare}
            label="Pending Reviews"
            value={stats.pendingReviews}
            color="bg-orange-500"
          />
          <StatCard
            icon={Users}
            label="Contact Submissions"
            value={stats.totalContacts}
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <Card className="p-8 bg-card mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                Upload Artwork
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                Manage Collections
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                Review Submissions
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="w-full">
                View All Artworks
              </Button>
            </Link>
          </div>
        </Card>

        {/* Notifications */}
        <div className="mb-8">
          <NotificationsPanel />
        </div>

        {/* Recent Activity */}
        <Card className="p-8 bg-card">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {artworksQuery.data && artworksQuery.data.slice(0, 5).map((artwork: any) => (
              <div key={artwork.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-semibold">{artwork.title}</p>
                  <p className="text-sm text-muted-foreground">Added to {artwork.collectionId}</p>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            ))}
            {(!artworksQuery.data || artworksQuery.data.length === 0) && (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
