
document.querySelectorAll('.delete-to-cart-button').forEach(button => {
    button.addEventListener('click', async function(event) {
      event.preventDefault();
  
      const productId = this.dataset.productId; 
        console.log(productId)
      try {
          Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
          }).then(async(result) => {
            console.log(result)
            if (result.isConfirmed) {
              const response = await fetch('/delete-to-cart', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
              });
              const data = await response.json();

              
              
              Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success",
                showConfirmButton: false,
                timer:3000
              });
              setTimeout(() => {
                location.reload();
            }, 2000);
            }
          });
      } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        // Mostrar un SweetAlert de error en caso de error en la solicitud
        Swal.fire('Error', 'Error al procesar la solicitud', 'error');
      }
    });
});


document.addEventListener('DOMContentLoaded', function() {
  const productRows = document.querySelectorAll('#data-product');
  let totalGeneral = 0;

  productRows.forEach(row => {
    const productPrice = parseFloat(row.dataset.productPrice);
    const productQuantity = parseInt(row.dataset.productQuantity);
    const totalPriceProduct = productPrice * productQuantity;

    row.querySelector('td:last-child').textContent = totalPriceProduct;
    
    totalGeneral += totalPriceProduct;
  });

  document.getElementById('totalGeneral').textContent = totalGeneral;
});
