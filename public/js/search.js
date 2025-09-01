// document.getElementById('location').addEventListener('click', async () => {
//     const userLocation = document.querySelector('.search-bar').value;
  
//     if (!userLocation) {
//       document.getElementById('response').innerText = 'Name is required.';
//       // alert("location is required")
//       return;
//     }
  
//     try {
//       const res = await fetch('/location', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userLocation })
//       });
    
//       const data = await res.json();
//       document.getElementById('response').innerText = data.message;
//     } catch (err) {
//       document.getElementById('response').innerText = 'Error sending name.';
//     }
//   });