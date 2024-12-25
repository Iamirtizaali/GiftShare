// document.addEventListener("DOMContentLoaded", () => {
//     const apiEndpoint = "http://localhost:3000/api/donor/dashboard"; // API Endpoint for dashboard data

//     // Fetch and populate data dynamically
//     const fetchAndPopulateData = async () => {
//         try {
//             const response = await fetch(apiEndpoint, {
//                 method: "GET",
//                 credentials: "include", // Include cookies for authentication
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to fetch donor dashboard data.");
//             }

//             const data = await response.json();

//             // Populate name and overview section
//             document.getElementById("accountHolderName").innerText = `Welcome, ${data.accountHolderName}`;
//             document.getElementById("totalDonations").innerText = `${data.totalDonations} Items`;
//             document.getElementById("pendingPickups").innerText = `${data.pendingPickups} Items`;
//             document.getElementById("familiesHelped").innerText = `${data.familiesHelped} Families Supported`;

//             // Populate upcoming pickups and deliveries table
//             const tableBody = document.getElementById("pickupDeliveryTable");
//             tableBody.innerHTML = ""; // Clear existing rows

//             data.upcomingPickups.forEach((pickup) => {
//                 const row = document.createElement("tr");
//                 row.innerHTML = `
//                     <td>${pickup.item}</td>
//                     <td>${pickup.date}</td>
//                     <td>${pickup.status}</td>
//                 `;
//                 tableBody.appendChild(row);
//             });
//         } catch (error) {
//             console.error("Error fetching dashboard data:", error);
//             alert("Unable to load dashboard data. Please try again later.");
//         }
//     };

//     // Fetch data on page load
//     fetchAndPopulateData();

//     // Logout Logic
//     const logoutBtn = document.getElementById("logoutBtn");
//     const logoutConfirmation = document.getElementById("logoutConfirmation");
//     const confirmLogout = document.getElementById("confirmLogout");
//     const cancelLogout = document.getElementById("cancelLogout");

//     logoutBtn.addEventListener("click", (e) => {
//         e.preventDefault();
//         document.body.classList.add("blur");
//         logoutConfirmation.style.display = "flex";
//     });

//     confirmLogout.addEventListener("click", async () => {
//         document.body.classList.remove("blur");
//         try {
//             await fetch("http://localhost:3000/api/logout", {
//                 method: "POST",
//                 credentials: "include", // Ensure cookies are sent
//             });
//             window.location.href = "index.html"; // Redirect to login page
//         } catch (error) {
//             console.error("Error during logout:", error);
//             alert("Failed to logout. Please try again.");
//         }
//     });

//     cancelLogout.addEventListener("click", () => {
//         document.body.classList.remove("blur");
//         logoutConfirmation.style.display = "none";
//     });
// });
