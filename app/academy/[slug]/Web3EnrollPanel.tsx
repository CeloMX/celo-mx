"use client";

import { EnrollPanel } from "@/components/academy/EnrollPanel";
import { Course } from "@/components/academy/types";
import { useCourseEnrollmentBadge } from "@/lib/hooks/useSimpleBadge";
import { useAccount } from "wagmi";

interface Web3EnrollPanelProps {
  course: Course;
}

export default function Web3EnrollPanel({ course }: Web3EnrollPanelProps) {
  const { address } = useAccount();
  const {
    hasBadge,
    hasClaimed,
    isLoading,
    enrollInCourse,
    enrollmentHash,
    enrollmentError,
    isEnrolling,
    isConfirmingEnrollment,
    enrollmentSuccess
  } = useCourseEnrollmentBadge(course.slug, address);

  const handleEnroll = async (course: Course) => {
    if (!address) {
      alert("Por favor conecta tu wallet para inscribirte en el curso.");
      return;
    }
    
    try {
      console.log("Enrolling in course:", course.title);
      await enrollInCourse();
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(`Error al inscribirse: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <EnrollPanel 
      course={course} 
      onEnroll={handleEnroll}
      enrollmentState={{
        hasBadge,
        hasClaimed,
        isLoading,
        isEnrolling,
        isConfirmingEnrollment,
        enrollmentSuccess,
        enrollmentError,
        enrollmentHash,
        isWalletConnected: !!address
      }}
    />
  );
}