import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, BookOpen, Heart, Award } from "lucide-react";

export default function Dashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <Card>
        <CardHeader>
          <Calendar size={32} />
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p>There are no upcoming events.</p>
          </CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Users size={32} />
          <CardTitle>Member Spotlight</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p>There are no members to spotlight.</p>
          </CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <BookOpen size={32} />
          <CardTitle>Member Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p>There are no articles to display.</p>
          </CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Heart size={32} />
          <CardTitle>Community Service</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p>There are no community service opportunities.</p>
          </CardDescription>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Award size={32} />
          <CardTitle>Member Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <p>There are no member achievements.</p>
          </CardDescription>
        </CardContent>
      </Card>
    </>
  );
}
