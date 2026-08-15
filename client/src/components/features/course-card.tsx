import Link from "next/link";
import { Clock, PlayCircle, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import type { Course, User } from "@/types";

const GRADIENTS = [
  "from-indigo-500 via-purple-500 to-fuchsia-500",
  "from-blue-500 via-cyan-500 to-teal-400",
  "from-violet-500 via-purple-500 to-pink-500",
  "from-sky-500 via-blue-500 to-indigo-500",
];

export function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const instructor = course.instructor as User | undefined;
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/courses/${course.slug}`} className="block">
        <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${gradient}`}>
          {course.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <>
              <span className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]" />
              <PlayCircle className="h-12 w-12 text-white/80 transition-transform duration-300 group-hover:scale-110" />
              <span className="absolute right-3 top-3">
                <Badge className="bg-white/20 text-white backdrop-blur-sm">{course.level}</Badge>
              </span>
            </>
          )}
        </div>
      </Link>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/courses/${course.slug}`} className="min-w-0">
            <h3 className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
              {course.title}
            </h3>
          </Link>
        </div>

        {instructor && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              {instructor.avatar ? (
                <AvatarImage src={instructor.avatar} alt={instructor.name} />
              ) : (
                <AvatarFallback className="text-[9px]">{getInitials(instructor.name)}</AvatarFallback>
              )}
            </Avatar>
            <span className="text-xs text-muted-foreground">{instructor.name}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" />
            {course.rating?.toFixed(1) || "New"}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.studentsEnrolled?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.durationHours}h
          </span>
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <span className="text-lg font-bold text-primary">
            {course.price && course.price > 0 ? `$${course.price}` : "Free"}
          </span>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/courses/${course.slug}`}>View Course</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
