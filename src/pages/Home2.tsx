import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, BookOpen, Heart, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white text-black">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Award className="h-6 w-6 text-green-600" />
              <span className="hidden font-bold sm:inline-block text-green-600">
                BASIS Cedar Park NJHS
              </span>
            </a>
            <nav className="flex items-center space-x-6 text-sm font-medium ml-0">
              <a
                className="transition-colors hover:text-black text-black"
                href="#about"
              >
                About
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="#pillars"
              >
                Pillars
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="#activities"
              >
                Activities
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="#membership"
              >
                Membership
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="/newsletter"
              >
                Newsletter
              </a>
              <a
                className="transition-colors hover:text-black text-black"
                href="/dashboard"
              >
                Member Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full">
        <section className="relative flex-1 flex items-center justify-center w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="absolute inset-0">
            <div className="carousel relative">
              <div className="carousel-item">
                <img
                  src="/path/to/image1.jpg"
                  alt="Image 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="carousel-item">
                <img
                  src="/path/to/image2.jpg"
                  alt="Image 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="carousel-item">
                <img
                  src="/path/to/image3.jpg"
                  alt="Image 3"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              <button
                className="w-3 h-3 rounded-full bg-white"
                data-carousel-slide="0"
              ></button>
              <button
                className="w-3 h-3 rounded-full bg-white"
                data-carousel-slide="1"
              ></button>
              <button
                className="w-3 h-3 rounded-full bg-white"
                data-carousel-slide="2"
              ></button>
            </div>
          </div>
          <div className="container relative px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                  Welcome to the BASIS Cedar Park NJHS Chapter
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                  Empowering students through scholarship, service, leadership,
                  character, and citizenship.
                </p>
              </div>
              <div className="space-x-4">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <a href="#membership">Join NJHS</a>
                </Button>
                <Button
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  asChild
                >
                  <a href="#activities">Our Activities</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="about"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-4">
              About Our Chapter
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed text-center">
              The BASIS Cedar Park NJHS chapter is dedicated to recognizing
              outstanding middle school students. We not only honor students for
              their academic achievements but also challenge them to develop
              further through active involvement in school activities and
              community service.
            </p>
          </div>
        </section>

        <section id="pillars" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-4">
              NJHS Pillars
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mt-8">
              {[
                {
                  title: "Scholarship",
                  icon: BookOpen,
                  description: "Maintaining academic excellence",
                },
                {
                  title: "Service",
                  icon: Heart,
                  description: "Contributing to school and community",
                },
                {
                  title: "Leadership",
                  icon: Users,
                  description: "Influencing and inspiring others",
                },
                {
                  title: "Character",
                  icon: Award,
                  description: "Demonstrating high standards",
                },
                {
                  title: "Citizenship",
                  icon: Award,
                  description: "Fulfilling civic duties",
                },
              ].map((pillar, index) => (
                <Card key={index}>
                  <CardHeader>
                    <pillar.icon className="w-8 h-8 mb-2 text-green-600" />
                    <CardTitle>{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{pillar.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section
          id="activities"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100"
        >
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-4">
              Our Activities
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {[
                {
                  title: "Activity One",
                  date: "Every First Saturday",
                  icon: Heart,
                },
                {
                  title: "Another Activity",
                  date: "Weekdays after school",
                  icon: BookOpen,
                },
                {
                  title: "NJHS Meeting",
                  date: "Monthly",
                  icon: Users,
                },
                {
                  title: "Third Activity",
                  date: "Quarterly",
                  icon: Award,
                },
                { title: "Activity 4", date: "Annually", icon: BookOpen },
                {
                  title: "Induction Ceremony",
                  date: "End of School Year",
                  icon: Award,
                },
              ].map((activity, index) => (
                <Card key={index}>
                  <CardHeader>
                    <activity.icon className="w-8 h-8 mb-2 text-green-600" />
                    <CardTitle>{activity.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      <Calendar className="w-4 h-4 inline-block mr-2 text-green-600" />
                      {activity.date}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="membership" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-4">
              Membership Information
            </h2>
            <div className="mx-auto max-w-[700px] space-y-4">
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                To be eligible for membership in NJHS, students must meet the
                following criteria:
              </p>
              <ul className="list-disc list-inside text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                <li>Maintain a cumulative GPA of 3.5 or higher</li>
                <li>
                  Demonstrate excellence in leadership, service, character, and
                  citizenship
                </li>
                <li>Be in grades 7-9</li>
                <li>Complete the membership application process in January</li>
              </ul>
              <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                If you have any questions about joining NJHS please contact our
                faculty advisor.
              </p>
              <div className="flex justify-center mt-6">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  asChild
                >
                  <a href="mailto:grace.carlock@basised.com">Contact Advisor</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="w-full py-6 bg-gray-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <Award className="h-6 w-6 text-green-600" />
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                © 2024 BASIS Cedar Park NJHS. All rights reserved.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
              <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
                Contact:{" "}
                <a
                  href="mailto:contact@basisnjhs.org"
                  className="underline hover:text-green-600"
                >
                  contact@basisnjhs.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
