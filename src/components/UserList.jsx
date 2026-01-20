import { useState } from "react";
import { UserCard } from "./UserCard";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { UserProfileDialog } from "./UserProfileDialog";

const sampleProfiles = [
  {
    id: 1,
    firstname: "Abbie",
    age: 23,
    education: "Bachelor's level",
    location: "Asan Nadia, Yishun",
    status: "Middleclass",
    language: "Marathi",
    lastLogin: "Jan 11th, 11:14 pm",
    handle: "abbie_handle",
    phone: "3332344434",
    email: "abbie@example.com",
    facebook: "abbieFB",
    instagram: "abbieIG",
    linkedin: "AbbieLinkedIn",
    bio: "Here we go",
  },
  {
    id: 2,
    firstname: "Melody",
    age: 24,
    education: "Intermediate",
    location: "96 Kuti Maratha",
    status: "Middleclass",
    language: "Marathi",
    lastLogin: "Dec 29th, 10:34 pm",
    image: "/professional-woman-smiling.png",
    isFavorite: true,
    handle: "melody_handle",
    phone: "3332344435",
    email: "melody@example.com",
    facebook: "melodyFB",
    instagram: "melodyIG",
    linkedin: "MelodyLinkedIn",
    bio: "Here we go",
  },
  {
    id: 3,
    firstname: "Shannon",
    age: 23,
    education: "Intermediate",
    location: "24 Marne Telugu Chennai",
    status: "Middleclass",
    language: "Tamil",
    lastLogin: "Jan 26th, 7:04 pm",
    handle: "shannon_handle",
    phone: "3332344436",
    email: "shannon@example.com",
    facebook: "shannonFB",
    instagram: "shannonIG",
    linkedin: "ShannonLinkedIn",
    bio: "Here we go",
  },
  {
    id: 4,
    firstname: "Lydia",
    age: 22,
    education: "Bachelor's level",
    location: "24 Marne Telugu Chennai",
    status: "Marry Middleclass",
    language: "Malayalam",
    lastLogin: "Jan 18th, 11:40 pm",
    handle: "lydia_handle",
    phone: "3332344437",
    email: "lydia@example.com",
    facebook: "lydiaFB",
    instagram: "lydiaIG",
    linkedin: "LydiaLinkedIn",
    bio: "Here we go",
  },
  {
    id: 5,
    firstname: "Lydia",
    age: 22,
    education: "Bachelor's level",
    location: "Achingapakkam Chennai",
    status: "Marry Middleclass",
    language: "Urdu",
    lastLogin: "Last Login:",
    handle: "lydia2_handle",
    phone: "3332344438",
    email: "lydia2@example.com",
    facebook: "lydia2FB",
    instagram: "lydia2IG",
    linkedin: "Lydia2LinkedIn",
    bio: "Here we go",
  },
  {
    id: 6,
    firstname: "Hazel",
    age: 23,
    education: "Intermediate",
    location: "24 Marne Telugu Chennai",
    status: "Marry Middleclass",
    language: "Malayalam",
    lastLogin: "Mar 28th, 6:12 pm",
    image: "/young-woman-portrait.png",
    handle: "hazel_handle",
    phone: "3332344439",
    email: "hazel@example.com",
    facebook: "hazelFB",
    instagram: "hazelIG",
    linkedin: "HazelLinkedIn",
    bio: "Here we go",
  },
];

export function UserList() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  // Calculate total pages
  const totalPages = Math.ceil(sampleProfiles.length / usersPerPage);

  // Get current users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sampleProfiles.slice(indexOfFirstUser, indexOfLastUser);

  // Pagination handlers
  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {currentUsers.map((profile) => (
          <UserCard setSelectedUser={setSelectedUser} profile={profile} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="my-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Previous Button */}
          <Button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            variant="outline"
            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {getPageNumbers().map((page, index) => {
              if (typeof page === 'string') {
                // Render ellipsis
                return (
                  <span
                    key={`${page}-${index}`}
                    className="w-10 h-10 flex items-center justify-center text-muted-foreground"
                  >
                    ...
                  </span>
                );
              }
              // Render page number button
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-background border border-border hover:bg-muted text-foreground'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            variant="outline"
            className="px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-primary-foreground transition-all bg-transparent"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* User Profile Dialog */}
      {selectedUser && (
        <UserProfileDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
