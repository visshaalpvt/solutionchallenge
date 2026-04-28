/**
 * Rule-based volunteer matching system.
 * ALL volunteers get a base score — zone/skill matching is a bonus, not a filter.
 * 
 * Scores volunteers against a task based on:
 * - Base score: +20 (everyone is eligible)
 * - Skill match: +30
 * - Zone match: +20
 * - Availability match: +20
 * - Low workload: +10
 */

export const matchVolunteers = (task, volunteers) => {
  if (!task || !volunteers?.length) return [];

  const scored = volunteers.map((volunteer) => {
    let score = 20; // Base score — every volunteer is eligible
    const breakdown = {
      base: 20,
      skill: 0,
      zone: 0,
      availability: 0,
      workload: 0,
    };

    // Skill match (+30)
    const requiredSkills = task.requiredSkills || [];
    const volunteerSkills = volunteer.skills || [];
    if (requiredSkills.length > 0) {
      const matchCount = requiredSkills.filter((skill) =>
        volunteerSkills.includes(skill)
      ).length;
      if (matchCount > 0) {
        const matchRatio = matchCount / requiredSkills.length;
        breakdown.skill = Math.round(30 * matchRatio);
        score += breakdown.skill;
      }
    } else {
      // No specific skills required — give everyone partial credit
      breakdown.skill = 10;
      score += 10;
    }

    // Zone match (+20) — bonus, not required
    if (task.zone && volunteer.zone && task.zone === volunteer.zone) {
      breakdown.zone = 20;
      score += 20;
    }

    // Availability match (+20)
    const volunteerAvailability = volunteer.availability || [];
    if (volunteerAvailability.length > 0) {
      const availabilityRatio = volunteerAvailability.length / 7;
      breakdown.availability = Math.round(20 * availabilityRatio);
      score += breakdown.availability;
    }

    // Low workload (+10)
    const activeTasks = volunteer.tasksActive || 0;
    if (activeTasks === 0) {
      breakdown.workload = 10;
      score += 10;
    } else if (activeTasks <= 2) {
      breakdown.workload = 5;
      score += 5;
    }

    return {
      ...volunteer,
      matchScore: score,
      matchBreakdown: breakdown,
    };
  });

  // Sort by score descending
  return scored.sort((a, b) => b.matchScore - a.matchScore);
};

export const getMatchLabel = (score) => {
  if (score >= 70) return { label: 'Excellent', color: 'text-urgency-low' };
  if (score >= 50) return { label: 'Good', color: 'text-urgency-medium' };
  if (score >= 30) return { label: 'Fair', color: 'text-urgency-high' };
  return { label: 'Available', color: 'text-slate-500' };
};
