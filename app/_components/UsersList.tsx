"use client";

import { useEffect, useState } from "react";
import { Users, UserCircle, Loader2 } from "lucide-react";

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <section className="py-14 md:py-24 bg-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-4 uppercase tracking-wider">
            <Users className="w-4 h-4" /> Community
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Registered <span className="text-primary">Users</span></h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Meet some of the members of our growing educational hub.</p>
        </div>

        {users.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
            No users found in the local database.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {users.map((u) => (
              <div key={u.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{u.name}</h4>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">{u.role || 'Member'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
