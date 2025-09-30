"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Play, Star, Users, Clock, Share2, Heart } from "lucide-react";
import { CourseHeader } from "@/components/academy/CourseHeader";
import { CourseCurriculum } from "@/components/academy/CourseCurriculum";
import { EnrollPanel } from "@/components/academy/EnrollPanel";
import CourseProgress from "@/components/academy/CourseProgress";
import { Course } from "@/components/academy/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getYouTubeVideoId, getYouTubeThumbnail, getYouTubeEmbedUrl } from "@/lib/youtube";
import dynamic from "next/dynamic";

// Dynamically import the Web3 enrollment panel to avoid SSR issues
const Web3EnrollPanel = dynamic(
  () => import('./Web3EnrollPanel'),
  { 
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }
);

interface CourseDetailClientProps {
  course: Course;
}

export function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fallback enrollment handler for when Web3 isn't available
  const handleFallbackEnroll = (course: Course) => {
    console.log("Enrolling in course:", course.title);
    alert("¡La función de inscripción estará disponible pronto! Se integrará con la wallet Privy y rampas de pago.");
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.subtitle,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <CourseHeader course={course} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Media */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {course.promoVideoUrl ? (
                <div className="relative w-full h-full">
                  {(() => {
                    const videoId = getYouTubeVideoId(course.promoVideoUrl);
                    if (videoId) {
                      return (
                        <>
                          <img
                            src={getYouTubeThumbnail(videoId)}
                            alt={`Vista previa de ${course.title}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Button
                              size="lg"
                              onClick={() => setShowVideoModal(true)}
                              className="bg-white/90 text-black hover:bg-white"
                            >
                              <Play className="w-6 h-6 mr-2" />
                              Ver Vista Previa
                            </Button>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-2xl text-center px-8">{course.title}</span>
                          </div>
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Button
                              size="lg"
                              onClick={() => setShowVideoModal(true)}
                              className="bg-white/90 text-black hover:bg-white"
                            >
                              <Play className="w-6 h-6 mr-2" />
                              Ver Vista Previa
                            </Button>
                          </div>
                        </>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-2xl text-center px-8">{course.title}</span>
                </div>
              )}
            </div>

            {/* Desktop: Continuous sections */}
            <div className="hidden lg:block space-y-8">
              {/* What you'll learn */}
              {course.outcomes && course.outcomes.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Lo que aprenderás</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.outcomes.map((outcome, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Prerrequisitos</h2>
                  <ul className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Course Curriculum */}
              <CourseCurriculum course={course} />

              {/* Instructor */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Instructor</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {course.instructor.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                        <p className="text-muted-foreground mb-2">{course.instructor.title}</p>
                        <p className="text-sm leading-relaxed">{course.instructor.bio}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews Placeholder */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Reseñas</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">¡Las reseñas y calificaciones estarán disponibles pronto!</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile: Tabs */}
            <div className="lg:hidden">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Resumen</TabsTrigger>
                  <TabsTrigger value="syllabus">Temario</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {/* What you'll learn */}
                  {course.outcomes && course.outcomes.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Lo que aprenderás</h3>
                      <div className="space-y-3">
                        {course.outcomes.map((outcome, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{outcome}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prerequisites */}
                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Prerrequisitos</h3>
                      <ul className="space-y-2">
                        {course.prerequisites.map((prereq, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{prereq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="syllabus" className="mt-6">
                  <CourseCurriculum course={course} />
                </TabsContent>

                <TabsContent value="instructor" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {course.instructor.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{course.instructor.name}</h3>
                          <p className="text-muted-foreground mb-2">{course.instructor.title}</p>
                          <p className="text-sm leading-relaxed">{course.instructor.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center py-8">
                        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Reviews and ratings will be available soon!</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">
              <CourseProgress courseSlug={course.slug} totalModules={course.modules.length} />
              {isMounted ? (
                <Web3EnrollPanel course={course} />
              ) : (
                <EnrollPanel course={course} onEnroll={handleFallbackEnroll} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && course.promoVideoUrl && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              ✕
            </Button>
            {(() => {
              const videoId = getYouTubeVideoId(course.promoVideoUrl);
              if (videoId) {
                return (
                  <iframe
                    src={getYouTubeEmbedUrl(videoId)}
                    title={`Video de ${course.title}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                );
              } else {
                return (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Play className="w-16 h-16 mx-auto mb-4" />
                      <p className="text-lg">¡Vista previa del video estará disponible pronto!</p>
                      <p className="text-sm opacity-75">Esto mostrará el video de introducción del curso</p>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
