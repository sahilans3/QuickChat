import { Search } from "lucide-react";

const SidebarSkeleton = () => {
  // Create 8 skeleton items
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside
      className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100/50"
    >
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-24 hidden lg:block" />
          <div className="skeleton h-5 w-16 hidden lg:block" />
        </div>
        
        {/* Search Bar Skeleton */}
        <div className="hidden lg:block relative">
          <div className="skeleton w-full h-10 rounded-xl" />
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-2 flex-1 scrollbar-thin scrollbar-thumb-base-300">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-4">
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0 flex-shrink-0">
              <div className="skeleton size-12 rounded-2xl" />
            </div>

            {/* User info skeleton - only visible on larger screens */}
            <div className="hidden lg:flex flex-col items-start min-w-0 flex-1 gap-2">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
