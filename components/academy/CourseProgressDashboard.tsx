"use client";

import { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Circle, ExternalLink, Award, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEnrollment } from '@/lib/contexts/EnrollmentContext';
import { useModulesCompleted, useHasCompletedModule } from '@/lib/hooks/useModuleCompletion';
import { getCourseTokenId } from '@/lib/courseToken';
import { useAuth } from '@/hooks/useAuth';
import { courseProgressPercent } from '@/lib/progress';
import { CertificateGenerator } from '@/components/certificates/CertificateGenerator';
import { SponsoredModuleCompletion } from './SponsoredModuleCompletion';
import { ModuleCompletionProvider } from '@/lib/contexts/ModuleCompletionContext';
import type { Address } from 'viem';

interface Module {
  index: number;
  title: string;
  summary?: string;
  lessons?: any[];
}

interface CourseProgressDashboardProps {
  courseSlug: string;
  courseId: string;
  courseTitle: string;
  modules: Module[];
  className?: string;
}

export function CourseProgressDashboard({
  courseSlug,
  courseId,
  courseTitle,
  modules,
  className = '',
}: CourseProgressDashboardProps) {
  const { wallet } = useAuth();
  const enrollment = useEnrollment();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userAddress = wallet?.address as Address | undefined;
  const tokenId = getCourseTokenId(courseSlug, courseId);
  const isEnrolled = enrollment.hasBadge || enrollment.hasClaimed || enrollment.enrollmentSuccess;

  // Get blockchain progress data
  const modulesCompleted = useModulesCompleted(userAddress, tokenId);
  
  // Get local storage progress for comparison
  const localProgress = mounted ? courseProgressPercent(courseSlug, modules.length) : 0;

  console.log('[COURSE PROGRESS DASHBOARD] State:', {
    courseSlug,
    isEnrolled,
    userAddress: userAddress || 'none',
    blockchainCompleted: modulesCompleted.data?.toString() || '0',
    localProgress,
    totalModules: modules.length,
  });

  if (!mounted) {
    return <CourseProgressSkeleton />;
  }

  if (!isEnrolled) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            {courseTitle} - Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <Trophy className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-900 mb-1">
                Enroll to Start Your Journey
              </p>
              <p className="text-xs text-blue-700">
                Get your enrollment NFT badge and start tracking your progress on the blockchain
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalModules = modules.length;
  const blockchainCompleted = Number(modulesCompleted.data || 0);
  const progressPercentage = totalModules > 0 ? Math.round((blockchainCompleted / totalModules) * 100) : 0;
  const isComplete = progressPercentage === 100;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Overall Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Course Progress
            </div>
            <Badge variant={isComplete ? "default" : "secondary"}>
              {progressPercentage}% Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Modules Completed</span>
              <span>{blockchainCompleted}/{totalModules}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          {/* NFT Badge Status */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <Award className="h-6 w-6 text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-900">
                Dynamic NFT Badge
              </p>
              <p className="text-xs text-purple-700">
                Your progress is stored on-chain and updates as you complete modules
              </p>
            </div>
            {tokenId && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://alfajores.celoscan.io/token/${process.env.NEXT_PUBLIC_MILESTONE_CONTRACT_ADDRESS_ALFAJORES}?a=${tokenId.toString()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs"
                >
                  View NFT <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>

          {/* Completion Reward */}
          {isComplete && (
            <div className="text-center py-4 border-t">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  <Trophy className="h-6 w-6 text-green-600" />
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  🎉 Course Completed!
                </p>
                <p className="text-xs text-green-600">
                  Your NFT badge now shows 100% completion. You can claim your certificate!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Modules Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modules.map((module, index) => (
              <ModuleProgressItem
                key={module.index || index}
                module={module}
                moduleIndex={index}
                courseSlug={courseSlug}
                courseId={courseId}
                userAddress={userAddress}
                isEnrolled={isEnrolled}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Generator */}
      <CertificateGenerator
        course={{
          id: courseId,
          slug: courseSlug,
          title: courseTitle,
          subtitle: null,
          categoryId: null,
          levelId: null,
          coverUrl: null,
          promoVideoUrl: null,
          durationHours: null,
          lessonsCount: null,
          rating: null,
          ratingCount: null,
          learners: null,
          isFree: true,
          visibility: 'PUBLIC' as const,
          status: 'PUBLISHED' as const,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }}
        completedModules={blockchainCompleted}
        totalModules={totalModules}
        completionPercentage={progressPercentage}
      />
    </div>
  );
}

interface ModuleProgressItemProps {
  module: Module;
  moduleIndex: number;
  courseSlug: string;
  courseId: string;
  userAddress?: Address;
  isEnrolled: boolean;
}

function ModuleProgressItem({
  module,
  moduleIndex,
  courseSlug,
  courseId,
  userAddress,
  isEnrolled,
}: ModuleProgressItemProps) {
  const tokenId = getCourseTokenId(courseSlug, courseId);
  const hasCompleted = useHasCompletedModule(userAddress, tokenId, moduleIndex);

  const isCompleted = hasCompleted.data || false;
  const isLoading = hasCompleted.isLoading;

  return (
    <div className="space-y-3">
      {/* Module Info */}
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Circle className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">
              Module {moduleIndex + 1}: {module.title}
            </p>
            {isCompleted && (
              <Badge variant="outline" className="text-xs">
                Completed
              </Badge>
            )}
          </div>
          {module.summary && (
            <p className="text-xs text-gray-500 mt-1">
              {module.summary}
            </p>
          )}
          {module.lessons && (
            <p className="text-xs text-gray-400 mt-1">
              {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="text-right text-xs text-gray-500">
          {isCompleted ? (
            <span className="text-green-600 font-medium">✓ Done</span>
          ) : (
            <span>Pending</span>
          )}
        </div>
      </div>
      
      {/* Sponsored Module Completion - Only show if enrolled and not completed */}
      {isEnrolled && !isCompleted && !isLoading && (
        <div className="pl-8">
          <ModuleCompletionProvider 
            courseSlug={courseSlug} 
            courseId={courseId} 
            moduleIndex={moduleIndex}
          >
            <SponsoredModuleCompletion
              courseSlug={courseSlug}
              courseId={courseId}
              moduleIndex={moduleIndex}
              moduleTitle={module.title}
              isCompleted={isCompleted}
              isEnrolled={isEnrolled}
              className="max-w-md"
            />
          </ModuleCompletionProvider>
        </div>
      )}
    </div>
  );
}

function CourseProgressSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="h-2 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-16 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-2 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}