/**
 * Staff Assignment Round-Robin Queue Utility
 *
 * Implements a FIFO queue for staff counselor recommendations:
 * 1. The staff member who has waited the longest (at the front of the queue) is recommended.
 * 2. When a staff member is assigned to a student, they move to the back (end) of the queue.
 * 3. When a new staff member is added to the system, they join at the very end of the queue.
 */

const QUEUE_STORAGE_KEY = 'edugate_staff_assignment_queue';

export function getStaffAssignmentQueue(availableStaff = [], opportunities = []) {
  if (!availableStaff || availableStaff.length === 0) {
    return { orderedStaff: [], recommendedStaff: null };
  }

  const staffMap = new Map();
  availableStaff.forEach((s) => {
    const id = Number(s.user_id || s.id);
    if (id) staffMap.set(id, s);
  });

  let savedQueue = [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (raw) {
      savedQueue = JSON.parse(raw);
    }
  } catch (_) {
    savedQueue = [];
  }

  // Filter saved queue to only include currently active/available staff
  let currentQueue = (Array.isArray(savedQueue) ? savedQueue : [])
    .map(Number)
    .filter((id) => staffMap.has(id));

  // If new staff members were added, append them to the END of the queue
  const currentQueueSet = new Set(currentQueue);
  availableStaff.forEach((s) => {
    const id = Number(s.user_id || s.id);
    if (id && !currentQueueSet.has(id)) {
      currentQueue.push(id);
      currentQueueSet.add(id);
    }
  });

  // If queue is completely empty (first time), initialize by least-recently assigned from opportunities
  if (currentQueue.length === 0) {
    const staffLastAssignmentMap = new Map();
    availableStaff.forEach((s) => {
      const id = Number(s.user_id || s.id);
      staffLastAssignmentMap.set(id, 0);
    });

    (opportunities || []).forEach((opp) => {
      const sId = Number(opp.assigned_staff_id);
      if (staffLastAssignmentMap.has(sId)) {
        const oppId = Number(opp.opportunity_id) || 0;
        const prev = staffLastAssignmentMap.get(sId);
        if (oppId > prev) {
          staffLastAssignmentMap.set(sId, oppId);
        }
      }
    });

    // Lowest opportunity ID / 0 comes first (front of queue)
    currentQueue = availableStaff
      .map((s) => Number(s.user_id || s.id))
      .sort((a, b) => staffLastAssignmentMap.get(a) - staffLastAssignmentMap.get(b));
  }

  // Persist synced queue
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(currentQueue));
  } catch (_) {}

  // Map IDs back to staff objects in queue order (front of queue first)
  const orderedStaff = currentQueue
    .map((id) => staffMap.get(id))
    .filter(Boolean);

  const recommendedStaff = orderedStaff[0] || null;

  return {
    orderedStaff,
    recommendedStaff,
  };
}

/**
 * Advances the queue by moving the assigned staff member to the very back of the queue.
 */
export function advanceStaffQueue(assignedStaffId) {
  if (!assignedStaffId) return;
  const targetId = Number(assignedStaffId);
  if (!targetId) return;

  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    let queue = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(queue)) queue = [];

    // Remove the assigned staff from their current position
    const filtered = queue.filter((id) => Number(id) !== targetId);
    // Push them to the end of the queue
    filtered.push(targetId);

    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));

    // Notify any open listeners to re-render recommendation
    window.dispatchEvent(
      new CustomEvent('edugate-staff-queue-changed', {
        detail: { assignedStaffId: targetId },
      })
    );
  } catch (err) {
    console.warn('[staffQueueUtils] Could not advance queue:', err);
  }
}

