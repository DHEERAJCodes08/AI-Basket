
const ProfileBtn = document.querySelector('#profile');

ProfileBtn.addEventListener('click', async () => {
    try {
        const response = await fetch("/check-auth-status"); // Replace with the actual endpoint to check authentication
        if (response.status === 200) {
          // User is authenticated
          window.location.href = "/userProfile"; // Redirect to the profile page
        } else {
          // User is not authenticated
          window.location.href = "SingUp.html"; // Redirect to the signup page
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      }
})