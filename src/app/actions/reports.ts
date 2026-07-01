'use server'

import { prisma } from '@/lib/prisma'
import { getUserSession } from '@/lib/auth'

const FILE_OPENED_STAGES = [
  "In progress",
  "Waiting for offer letter",
  "Offer issued",
  "Payment expected",
  "Paid tuition fees",
  "Waiting for interview",
  "Visa application",
  "Visa granted",
  "Course In Progress",
  "Course Completed"
]

export interface CounselorReport {
  counselorId: string;
  counselorName: string;
  leadsHanded: number;
  leadsContacted: number;
  filesOpened: number;
  leadsCreated: number;
  activePipeline: number;
  stageBreakdown: { stage: string; count: number }[];
}

export async function generateReports(startDate: Date, endDate: Date, counselorId?: string): Promise<CounselorReport[]> {
  const user = await getUserSession()
  if (!user) throw new Error('Unauthorized')
  
  // If user is a Counselor, they can only see their own report
  const isCounselor = user.role === 'Counselor'
  const targetCounselorId = isCounselor ? user.id : counselorId

  // Fetch counselors to report on, restricted to the user's company
  const counselors = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
      ...(targetCounselorId ? { id: targetCounselorId } : {}),
      role: { in: ['Counselor', 'Manager', 'Super Admin'] } 
    },
    select: { id: true, fullName: true, role: true }
  });

  const reports: CounselorReport[] = [];

  for (const counselor of counselors) {
    // 1. Leads Handed (Assigned in timeframe)
    const leadsHanded = await prisma.lead.count({
      where: {
        companyId: user.companyId,
        assignedCounselorId: counselor.id,
        OR: [
          { assignedAt: { gte: startDate, lte: endDate } },
          { assignedAt: null, createdAt: { gte: startDate, lte: endDate } } // Fallback for old leads
        ]
      }
    });

    // 2. Leads Contacted (Stage != "New" contacted in timeframe)
    const leadsContacted = await prisma.lead.count({
      where: {
        companyId: user.companyId,
        assignedCounselorId: counselor.id,
        OR: [
          { contactedAt: { gte: startDate, lte: endDate } },
          { contactedAt: null, createdAt: { gte: startDate, lte: endDate }, stage: { not: "New" } } // Fallback
        ]
      }
    });

    // 3. Files Opened
    const filesOpened = await prisma.lead.count({
      where: {
        companyId: user.companyId,
        assignedCounselorId: counselor.id,
        isFileOpened: true,
        fileOpenedAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // 4. Leads Created
    const leadsCreated = await prisma.lead.count({
      where: {
        companyId: user.companyId,
        createdById: counselor.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // 5. Active Pipeline (All leads currently assigned, no date filter)
    const activePipeline = await prisma.lead.count({
      where: {
        companyId: user.companyId,
        assignedCounselorId: counselor.id
      }
    });

    // 6. Stage-by-Stage Breakdown (for currently assigned active pipeline)
    const stageGroups = await prisma.lead.groupBy({
      by: ['stage'],
      where: {
        companyId: user.companyId,
        assignedCounselorId: counselor.id,
      },
      _count: {
        id: true
      }
    });

    const stageBreakdown = stageGroups.map(g => ({
      stage: g.stage,
      count: g._count.id
    }));

    // Only add to report if they actually had activity or if we are filtering for a specific counselor
    if (leadsHanded > 0 || activePipeline > 0 || leadsCreated > 0 || filesOpened > 0 || targetCounselorId) {
      reports.push({
        counselorId: counselor.id,
        counselorName: counselor.fullName,
        leadsHanded,
        leadsContacted,
        filesOpened,
        leadsCreated,
        activePipeline,
        stageBreakdown
      });
    }
  }

  // Sort by most leads handed
  return reports.sort((a, b) => b.leadsHanded - a.leadsHanded);
}

export async function getAllCounselors() {
  const user = await getUserSession()
  if (!user || user.role === 'Counselor') return []

  return await prisma.user.findMany({
    where: {
      companyId: user.companyId,
      role: { in: ['Counselor', 'Manager', 'Super Admin'] }
    },
    select: { id: true, fullName: true },
    orderBy: { fullName: 'asc' }
  });
}
