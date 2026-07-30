'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Brain,
  Users,
  Shield,
  GitBranch,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Matching',
    description:
      'Smart task decomposition and worker matching powered by AI to find the right talent for every project.',
  },
  {
    icon: GitBranch,
    title: 'Kanban Task Boards',
    description:
      'Visualize your project workflow with intuitive drag-and-drop Kanban boards for seamless task management.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Real-time collaboration with role-based dashboards for clients, workers, and administrators.',
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description:
      'Integrated Stripe payment processing with automated billing and transparent pricing.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '$500',
    period: '/mo',
    description: 'Perfect for small projects and freelancers',
    features: [
      'Up to 5 active projects',
      '10 tasks per project',
      'Basic AI task assistance',
      'Email support',
      'Standard analytics',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Growth',
    price: '$2,000',
    period: '/mo',
    description: 'For growing teams and agencies',
    features: [
      'Up to 20 active projects',
      'Unlimited tasks',
      'Advanced AI decomposition',
      'Worker matching',
      'Priority support',
      'Advanced analytics',
      'Time tracking',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    features: [
      'Unlimited projects',
      'Unlimited tasks',
      'Custom AI models',
      'Dedicated account manager',
      'SSO & SAML',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-2 h-3 w-3" />
              AI-First Dev Consult Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Build faster with
              <span className="text-primary"> AI-powered</span> development
              consulting
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Connect with top talent, decompose complex tasks with AI, and
              deliver projects on time with our intelligent platform.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to scale
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Powerful tools for modern development teams
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" id="pricing">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your team&apos;s needs
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  tier.popular
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : ''
                )}
              >
                <CardHeader>
                  {tier.popular && (
                    <Badge className="w-fit mb-2">Most Popular</Badge>
                  )}
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckIcon className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/auth/register" className="w-full">
                    <Button
                      variant={tier.popular ? 'default' : 'outline'}
                      className="w-full"
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join thousands of teams building better with AI
          </p>
          <Link href="/auth/register" className="mt-8 inline-block">
            <Button size="lg">Create Free Account</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
