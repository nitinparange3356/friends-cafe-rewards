// Test Supabase connectivity
// Paste this in browser console to debug

const testSupabase = async () => {
  const url = "https://umlqofhdkmsusxvsubqr.supabase.co";
  
  console.log("🔍 Testing Supabase connectivity...");
  console.log("URL:", url);
  
  try {
    const response = await fetch(`${url}/auth/v1/`, {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbHFvZmhka21zdXN4dnN1YnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NTAwNzQsImV4cCI6MjA4ODUyNjA3NH0.MI8McD-VF3I-9Z81YARbKNFXDrRgW_jGbkCnFIsH-uk'
      }
    });
    console.log("✅ SUCCESS! Supabase is reachable");
    console.log("Status:", response.status);
  } catch (error) {
    console.error("❌ FAILED! Error:", error.message);
    console.error("Full error:", error);
  }
};

testSupabase();
