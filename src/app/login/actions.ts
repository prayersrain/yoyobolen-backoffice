"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function loginWithBruteProtection(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // 1. Check if user is currently locked out
    const attempt = await prisma.loginAttempt.findUnique({
      where: { email }
    });

    if (attempt?.lockUntil && attempt.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((attempt.lockUntil.getTime() - Date.now()) / 60000);
      return { 
        success: false, 
        error: `Security Lockout: Too many failed attempts. Please try again in ${remainingMinutes} minute(s).` 
      };
    }

    // 2. Clear expired lockouts
    if (attempt?.lockUntil && attempt.lockUntil <= new Date()) {
       // Optional: Reset count if locked period passed, or keep to escalate?
       // Let's reset count slightly so it doesn't immediately lock for an hour on the next fail
    }

    // 3. Attempt Supabase Auth
    const supabase = await createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // 4. Handle Failure: Update Attempt Count and Lockout
      const newCount = (attempt?.attemptCount || 0) + 1;
      let lockUntil: Date | null = null;

      if (newCount === 3) {
        lockUntil = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
      } else if (newCount === 6) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      } else if (newCount >= 9) {
        lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      }

      await prisma.loginAttempt.upsert({
        where: { email },
        create: { 
          email, 
          attemptCount: newCount, 
          lockUntil: lockUntil, 
          lastAttempt: new Date() 
        },
        update: { 
          attemptCount: newCount, 
          lockUntil: lockUntil, 
          lastAttempt: new Date() 
        }
      });

      const message = lockUntil 
        ? `Invalid password. Security lockout active for ${newCount === 3 ? '3' : newCount === 6 ? '15' : '60'} minutes.` 
        : `Invalid credentials. ${3 - (newCount % 3 === 0 ? 3 : newCount % 3)} attempts remaining until temporary lockout.`;

      return { success: false, error: message };
    }

    // 5. Handle Success: Reset attempts
    await prisma.loginAttempt.deleteMany({
      where: { email }
    });

    return { success: true };

  } catch (error: any) {
    console.error("Login Protection Error:", error);
    return { success: false, error: "An internal security error occurred." };
  }
}
