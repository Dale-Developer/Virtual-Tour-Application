import { supabase } from '../../lib/supabase'; 
import { SEED_DESTINATIONS } from './seed';
import { CATEGORIES, PROVINCES } from '../theme';

export const PASSING_PERCENT = 60;

/** The schema has no province column, so it is read from the end of the address. */
export function provinceOf(address = '') {
  const parts = address.split(',').map((s) => s.trim().toLowerCase()).reverse();
  for (const part of parts) {
    const hit = PROVINCES.find((p) => part.includes(p.toLowerCase()));
    if (hit) return hit;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Helper Mappers (Ensures your UI stays exactly the same)             */
/* ------------------------------------------------------------------ */
const mapDestination = (r) => {
  if (!r) return null;
  return {
    id: r.destination_id,
    name: r.destination_name,
    description: r.description,
    address: r.destination_address,
    category: r.category,
    image: r.image,
    latitude: r.latitude,
    longitude: r.longitude,
    panorama_asset: r.panorama_asset,
    created_by: r.created_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
    province: provinceOf(r.destination_address)
  };
};

const mapUser = (r) => {
  if (!r) return null;
  return {
    id: r.user_id,
    first_name: r.first_name,
    last_name: r.last_name,
    name: `${r.first_name} ${r.last_name}`,
    username: r.username,
    role: r.role
  };
};

/* ------------------------------------------------------------------ */
/* Setup & Seeding                                                     */
/* ------------------------------------------------------------------ */
export async function initDB() {
  // Supabase handles tables in the cloud. We just need to check if seed data exists.
  const { count, error } = await supabase
    .from('destinations')
    .select('*', { count: 'exact', head: true });
    
  if (count === 0 && !error) {
    // We need an admin ID to attach created_by. 
    // For testing, we'll just insert without created_by if not logged in.
    const { data: { user } } = await supabase.auth.getUser();
    await seedDestinations(user ? user.id : null);
  }
}

export async function seedDestinations(createdBy) {
  for (const d of SEED_DESTINATIONS) {
    const { data: destData, error: destError } = await supabase
      .from('destinations')
      .insert([{
        destination_name: d.name,
        description: d.description,
        destination_address: d.address,
        category: d.category,
        image: d.image,
        latitude: d.latitude,
        longitude: d.longitude,
        panorama_asset: d.panorama,
        created_by: createdBy
      }])
      .select();

    if (!destError && destData && destData.length > 0) {
      const newDestId = destData[0].destination_id;
      for (const [question, options, correct, explanation] of d.questions) {
        await supabase.from('quiz_questions').insert([{
          destination_id: newDestId,
          question: question,
          options: options, // Supabase handles JSON natively
          correct_answer: correct,
          explanation: explanation
        }]);
      }
    }
  }
}

export async function resetSampleData(adminId) {
  await supabase.from('user_progress').delete().neq('progress_id', 0);
  await supabase.from('quiz_questions').delete().neq('quiz_id', 0);
  await supabase.from('destinations').delete().neq('destination_id', 0);
  await seedDestinations(adminId);
}

/* ------------------------------------------------------------------ */
/* Users / auth                                                        */
/* ------------------------------------------------------------------ */
export async function getUserById(id) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', id)
    .single();
  if (error) return null;
  return mapUser(data);
}

// export async function registerUser({ first_name, last_name, username, password }) {
//   const cleanUsername = username.trim().toLowerCase();
  
//   // Check if username exists
//   const { data: existing } = await supabase.from('profiles').select('username').eq('username', cleanUsername).single();
//   if (existing) throw new Error('That username is taken. Please choose another one.');

//   // Use a fake email for Supabase Auth
//   const fakeEmail = `${cleanUsername}@example.com`;

//   const { data: authData, error: authError } = await supabase.auth.signUp({
//     email: fakeEmail,
//     password: password,
//   });

//   if (authError) throw new Error(authError.message);

//   // Insert into profiles table
//   const { error: profileError } = await supabase.from('profiles').insert([{
//     user_id: authData.user.id,
//     first_name: first_name.trim(),
//     last_name: last_name.trim(),
//     username: cleanUsername,
//     role: 'Tourist'
//   }]);

//   if (profileError) throw new Error(profileError.message);
//   return getUserById(authData.user.id);
// }
export async function registerUser({ first_name, last_name, username, password }) {
  const cleanUsername = username.trim().toLowerCase();
  
  // Check if username exists in profiles
  const { data: existing } = await supabase.from('profiles').select('username').eq('username', cleanUsername).single();
  if (existing) throw new Error('That username is taken. Please choose another one.');

  const fakeEmail = `${cleanUsername}@example.com`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: fakeEmail,
    password: password,
  });

  if (authError) throw new Error(authError.message);

  // SAFETY CHECK: Did Supabase actually return the user?
  if (!authData.user) {
    throw new Error("Registration failed. The email/username might already be in use, or email confirmation is still enabled in Supabase.");
  }

  // Insert into profiles table
  const { error: profileError } = await supabase.from('profiles').insert([{
    user_id: authData.user.id,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    username: cleanUsername,
    role: 'Tourist'
  }]);

  if (profileError) {
    throw new Error(profileError.message);
  }
  
  return getUserById(authData.user.id);
}
export async function loginUser(username, password) {
  const fakeEmail = `${username.trim().toLowerCase()}@example.com`;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: fakeEmail,
    password: password,
  });

  if (error) throw new Error('Username or password is incorrect.');
  
  // Fetch user profile
  const user = await getUserById(data.user.id);
  return user;
}

// Supabase AsyncStorage handles sessions automatically behind the scenes!
export async function saveSession(userId) { /* Handled by Supabase */ }
export async function clearSession() { await supabase.auth.signOut(); }

export async function loadSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return getUserById(session.user.id);
}

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */
export async function listDestinations({ search = '', category = 'All', province = 'All' } = {}) {
  let query = supabase.from('destinations').select('*');

  if (search.trim()) {
    query = query.or(`destination_name.ilike.%${search}%,description.ilike.%${search}%,destination_address.ilike.%${search}%`);
  }
  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('destination_name', { ascending: true });
  if (error) return [];

  let rows = data.map(mapDestination);
  if (province && province !== 'All') rows = rows.filter((r) => r.province === province);
  return rows;
}

export async function getDestination(id) {
  const { data } = await supabase.from('destinations').select('*').eq('destination_id', id).single();
  return mapDestination(data);
}

export async function getCategories() {
  const { data } = await supabase.from('destinations').select('category');
  if (!data) return [];
  const cats = [...new Set(data.map(r => r.category))];
  return cats.sort();
}

const num = (v) => (v === '' || v == null ? null : Number(v));

export async function createDestination(d, createdBy) {
  const { data, error } = await supabase.from('destinations').insert([{
    destination_name: d.name.trim(),
    description: d.description.trim(),
    destination_address: d.address.trim(),
    category: d.category,
    image: d.image || null,
    latitude: num(d.latitude),
    longitude: num(d.longitude),
    panorama_asset: d.panorama_asset || null,
    created_by: createdBy
  }]).select();

  if (error) throw new Error(error.message);
  return data[0].destination_id;
}

export async function updateDestination(id, d) {
  await supabase.from('destinations').update({
    destination_name: d.name.trim(),
    description: d.description.trim(),
    destination_address: d.address.trim(),
    category: d.category,
    image: d.image || null,
    latitude: num(d.latitude),
    longitude: num(d.longitude),
    panorama_asset: d.panorama_asset || null,
    updated_at: new Date().toISOString()
  }).eq('destination_id', id);
}

export async function deleteDestination(id) {
  await supabase.from('destinations').delete().eq('destination_id', id);
}

/* ------------------------------------------------------------------ */
/* Quiz questions                                                      */
/* ------------------------------------------------------------------ */
export async function listQuestions(destinationId) {
  const { data } = await supabase.from('quiz_questions')
    .select('*')
    .eq('destination_id', destinationId)
    .order('quiz_id', { ascending: true });
    
  if (!data) return [];
  return data.map(q => ({
    id: q.quiz_id,
    destination_id: q.destination_id,
    question: q.question,
    options: q.options, // Already an array in Supabase JSONB
    answer_index: q.correct_answer,
    explanation: q.explanation
  }));
}

export async function getQuestion(id) {
  const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_id', id).single();
  if (!data) return null;
  return {
    id: data.quiz_id,
    destination_id: data.destination_id,
    question: data.question,
    options: data.options,
    answer_index: data.correct_answer,
    explanation: data.explanation
  };
}

export async function createQuestion({ destination_id, question, options, answer_index, explanation }) {
  await supabase.from('quiz_questions').insert([{
    destination_id,
    question: question.trim(),
    options: options.map(o => o.trim()),
    correct_answer: answer_index,
    explanation: explanation?.trim() || null
  }]);
}

export async function updateQuestion(id, { question, options, answer_index, explanation }) {
  await supabase.from('quiz_questions').update({
    question: question.trim(),
    options: options.map(o => o.trim()),
    correct_answer: answer_index,
    explanation: explanation?.trim() || null
  }).eq('quiz_id', id);
}

// export async function deleteQuestion(id) {
//   await supabase.from('quiz_questions').delete().eq('quiz_id', id);
// }
export async function deleteQuestion(id) {
  const { error } = await supabase
    .from('quiz_questions')
    .delete()
    .eq('quiz_id', id);

  if (error) {
    console.error("Supabase Delete Error:", error);
    throw new Error(error.message);
  }
}

export async function listDestinationsWithQuestionCount() {
  const { data } = await supabase.from('destinations').select(`
    destination_id, destination_name, destination_address, category, image,
    quiz_questions(count)
  `).order('destination_name', { ascending: true });

  if (!data) return [];

  return data.map(d => ({
    id: d.destination_id,
    name: d.destination_name,
    address: d.destination_address,
    category: d.category,
    image: d.image,
    question_count: d.quiz_questions[0]?.count || 0
  }));
}

/* ------------------------------------------------------------------ */
/* Progress tracking                                                   */
/* ------------------------------------------------------------------ */
export async function saveQuizResult({ userId, destinationId, score, total }) {
  await supabase.from('user_progress').insert([{
    user_id: userId,
    destination_id: destinationId,
    quiz_score: score,
    quiz_total: total
  }]);
}

export async function getProgress(userId) {
  // Get all destinations and all user progress
  const { data: dests } = await supabase.from('destinations').select('*, quiz_questions(count)');
  const { data: progress } = await supabase.from('user_progress').select('*').eq('user_id', userId);

  if (!dests) return [];

  return dests.map(d => {
    const destProgress = progress?.filter(p => p.destination_id === d.destination_id) || [];
    
    // Find best score
    let bestRatio = null;
    let bestScore = null;
    let bestTotal = null;

    destProgress.forEach(p => {
      const ratio = p.quiz_score / p.quiz_total;
      if (bestRatio === null || ratio > bestRatio) {
        bestRatio = ratio;
        bestScore = p.quiz_score;
        bestTotal = p.quiz_total;
      }
    });

    const completed = bestRatio !== null && (bestRatio * 100) >= PASSING_PERCENT;

    return {
      id: d.destination_id,
      name: d.destination_name,
      image: d.image,
      category: d.category,
      address: d.destination_address,
      question_count: d.quiz_questions[0]?.count || 0,
      best_ratio: bestRatio,
      best_score: bestScore,
      best_total: bestTotal,
      attempts: destProgress.length,
      passed: completed,
      completed: completed
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProgressFor(userId, destinationId) {
  const all = await getProgress(userId);
  return all.find((p) => p.id === destinationId) || null;
}

export async function getRecentResults(userId, limit = 8) {
  const { data } = await supabase.from('user_progress')
    .select(`
      progress_id, quiz_score, quiz_total, completed_at,
      destinations(destination_name)
    `)
    .eq('user_id', userId)
    .order('progress_id', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map(p => ({
    id: p.progress_id,
    score: p.quiz_score,
    total: p.quiz_total,
    completed_at: p.completed_at,
    destination_name: p.destinations.destination_name
  }));
}

/* ------------------------------------------------------------------ */
/* Admin reporting                                                     */
/* ------------------------------------------------------------------ */
export async function getAdminStats() {
  const { count: dests } = await supabase.from('destinations').select('*', { count: 'exact', head: true });
  const { count: quizzes } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true });
  const { count: tourists } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'Tourist');
  const { data: progress } = await supabase.from('user_progress').select('quiz_score, quiz_total, user_id, destination_id');

  let avgPercent = null;
  let completed = 0;

  if (progress && progress.length > 0) {
    const totalRatio = progress.reduce((acc, curr) => acc + (curr.quiz_score / curr.quiz_total), 0);
    avgPercent = Math.round((totalRatio / progress.length) * 100);

    // Count completed
    const grouped = {};
    progress.forEach(p => {
      const key = `${p.user_id}-${p.destination_id}`;
      const ratio = p.quiz_score / p.quiz_total;
      if (!grouped[key] || ratio > grouped[key]) grouped[key] = ratio;
    });
    completed = Object.values(grouped).filter(r => r >= (PASSING_PERCENT / 100)).length;
  }

  return {
    destinations: dests || 0,
    questions: quizzes || 0,
    tourists: tourists || 0,
    attempts: progress?.length || 0,
    completed: completed,
    avgPercent: avgPercent
  };
}

export async function getPopularDestinations(limit = 5) {
  const { data: dests } = await supabase.from('destinations').select('destination_id, destination_name');
  const { data: progress } = await supabase.from('user_progress').select('destination_id');

  if (!dests) return [];

  const counts = {};
  progress?.forEach(p => {
    counts[p.destination_id] = (counts[p.destination_id] || 0) + 1;
  });

  return dests.map(d => ({
    id: d.destination_id,
    name: d.destination_name,
    attempts: counts[d.destination_id] || 0
  })).sort((a, b) => b.attempts - a.attempts).slice(0, limit);
}

export async function listTourists() {
  const { data: users } = await supabase.from('profiles').select('*').eq('role', 'Tourist').order('created_at', { ascending: false });
  const { data: progress } = await supabase.from('user_progress').select('*');

  if (!users) return [];

  return users.map(u => {
    const userProgress = progress?.filter(p => p.user_id === u.user_id) || [];
    
    // Calculate avg ratio
    let avgRatio = null;
    if (userProgress.length > 0) {
      avgRatio = userProgress.reduce((acc, p) => acc + (p.quiz_score / p.quiz_total), 0) / userProgress.length;
    }

    // Calculate completed
    const grouped = {};
    userProgress.forEach(p => {
      const ratio = p.quiz_score / p.quiz_total;
      if (!grouped[p.destination_id] || ratio > grouped[p.destination_id]) grouped[p.destination_id] = ratio;
    });
    const completed = Object.values(grouped).filter(r => r >= (PASSING_PERCENT / 100)).length;

    return {
      id: u.user_id,
      name: `${u.first_name} ${u.last_name}`,
      username: u.username,
      created_at: u.created_at,
      attempts: userProgress.length,
      completed: completed,
      avg_ratio: avgRatio
    };
  });
}

export async function deleteUser(id) {
  // Note: Deleting from auth requires admin privileges. 
  // For a class project, deleting the profile is usually enough to hide them.
  await supabase.from('profiles').delete().eq('user_id', id).eq('role', 'Tourist');
}

/* ------------------------------------------------------------------ */
/* Account settings                                                    */
/* ------------------------------------------------------------------ */
export async function updateProfile(userId, { first_name, last_name, username }) {
  const cleanUsername = username.trim().toLowerCase();
  
  const { data: clash } = await supabase.from('profiles').select('user_id').eq('username', cleanUsername).neq('user_id', userId).single();
  if (clash) throw new Error('That username is taken. Please choose another one.');

  await supabase.from('profiles').update({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    username: cleanUsername
  }).eq('user_id', userId);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error('Could not update password. Please try again.');
}

export async function deleteAccount(userId) {
  await supabase.from('profiles').delete().eq('user_id', userId);
  await supabase.auth.signOut();
}

/* ------------------------------------------------------------------ */
/* App settings (custom logo)                                          */
/* ------------------------------------------------------------------ */
export async function getSetting(key) {
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).single();
  return data ? data.value : null;
}

export async function setSetting(key, value) {
  // Upsert means: Insert if it doesn't exist, Update if it does
  await supabase.from('app_settings').upsert({ key: key, value: value });
}

export async function deleteSetting(key) {
  await supabase.from('app_settings').delete().eq('key', key);
}