/**
 * Rule-based volunteer matching system.
 * Scores volunteers against a task based on:
 * - Skill match: +40
 * - Zone match: +30
 * - Availability match: +20
 * - Low workload: +10
 */

export const matchVolunteers = (task, volunteers) => {
  if (!task || !volunteers?.length) return [];

  const scored = volunteers.map((volunteer) => {
    let score = 0;
    const breakdown = {
      skill: 0,
      zone: 0,
      availability: 0,
      workload: 0,
    };

    // Skill match (+40)
    const requiredSkills = task.requiredSkills || [];
    const volunteerSkills = volunteer.skills || [];
    if (requiredSkills.length > 0) {
      const hasMatchingSkill = requiredSkills.some((skill) =>
        volunteerSkills.includes(skill)
      );
      if (hasMatchingSkill) {
        // Bonus for matching multiple skills
        const matchCount = requiredSkills.filter((skill) =>
          volunteerSkills.includes(skill)
        ).length;
        const matchRatio = matchCount / requiredSkills.length;
        breakdown.skill = Math.round(40 * matchRatio);
        score += breakdown.skill;
      }
    }

    // Zone match (+30)
    if (task.zone && volunteer.zone && task.zone === volunteer.zone) {
      breakdown.zone = 30;
      score += 30;
    }

    // Availability match (+20)
    const volunteerAvailability = volunteer.availability || [];
    if (volunteerAvailability.length > 0) {
      // More available days = higher score
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
  if (score >= 80) return { label: 'Excellent', color: 'text-urgency-low' };
  if (score >= 60) return { label: 'Good', color: 'text-urgency-medium' };
  if (score >= 40) return { label: 'Fair', color: 'text-urgency-high' };
  return { label: 'Low', color: 'text-urgency-critical' };
};
