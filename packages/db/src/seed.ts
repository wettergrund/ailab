import { db } from './db';
import { users, projects, tasks, bids, payments } from './schema/index';
import { hash } from 'bcrypt';

async function seed() {
  const [alice, bob, charlie] = await db
    .insert(users)
    .values([
      {
        email: 'alice@example.com',
        passwordHash: await hash('password123', 10),
        role: 'client',
      },
      {
        email: 'bob@example.com',
        passwordHash: await hash('password123', 10),
        role: 'worker',
      },
      {
        email: 'charlie@example.com',
        passwordHash: await hash('password123', 10),
        role: 'worker',
      },
      {
        email: 'diana@example.com',
        passwordHash: await hash('password123', 10),
        role: 'admin',
      },
    ])
    .returning();

  const [project] = await db
    .insert(projects)
    .values([
      {
        clientId: alice.id,
        name: 'E-commerce Platform Redesign',
        description:
          'Complete redesign of the client-facing e-commerce platform with modern UI/UX.',
        status: 'active',
        budget: '15000',
      },
    ])
    .returning();

  const [task1, task2] = await db
    .insert(tasks)
    .values([
      {
        projectId: project.id,
        title: 'Design homepage mockups',
        description:
          'Create high-fidelity mockups for the new homepage layout.',
        priority: 'high',
        status: 'open',
        aiGenerated: true,
        estimatedHours: '8',
      },
      {
        projectId: project.id,
        title: 'Implement checkout flow',
        description:
          'Build the Stripe-integrated checkout flow with validation.',
        priority: 'high',
        status: 'open',
        assigneeId: bob.id,
        aiGenerated: false,
        estimatedHours: '12',
      },
    ])
    .returning();

  await db.insert(bids).values([
    {
      taskId: task1.id,
      workerId: bob.id,
      proposedHours: '7',
      proposedPrice: '700',
      status: 'pending',
    },
    {
      taskId: task2.id,
      workerId: charlie.id,
      proposedHours: '14',
      proposedPrice: '1400',
      status: 'pending',
    },
  ]);

  await db.insert(payments).values([
    {
      projectId: project.id,
      amount: '5000',
      status: 'succeeded',
      stripePaymentIntentId: 'pi_mock_12345',
    },
    {
      projectId: project.id,
      amount: '3000',
      status: 'pending',
      stripePaymentIntentId: 'pi_mock_67890',
    },
  ]);

  console.log('Seed data inserted successfully');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
