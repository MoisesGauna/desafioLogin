



document.querySelectorAll('.add-to-cart-button').forEach(button => {
    button.addEventListener('click', async function (event) {
        event.preventDefault();

        const productId = this.dataset.productId;
        const quantity = parseInt(this.parentElement.querySelector('.quantity-input-field').value); // Obtener la cantidad del campo de entrada

        try {
            const response = await fetch('/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity }) // Incluir la cantidad en la solicitud
            });

            const data = await response.json();

            if (data.success) {
                // Mostrar un SweetAlert de éxito
                Swal.fire({
                    position: "bottom-end",
                    width: 200,
                    Height: 200,
                    background: "#0b5ed7",
                    color: "#fff",
                    text: "Producto agregado",
                    showConfirmButton: false,
                    timer: 1000
                });
            } else {
                // Mostrar un SweetAlert de error
                Swal.fire('Error', data.message, 'error');
            }
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            // Mostrar un SweetAlert de error en caso de error en la solicitud
            Swal.fire('Error', 'Error al procesar la solicitud', 'error');
        }
    });
});




document.querySelectorAll('.quantity-button').forEach(button => {
    button.addEventListener('click', function (event) {
        event.preventDefault();

        const inputField = this.parentElement.querySelector('.quantity-input-field');
        let quantity = parseInt(inputField.value);

        if (this.classList.contains('quantity-up')) {
            quantity++;
        } else if (this.classList.contains('quantity-down')) {
            quantity = Math.max(1, quantity - 1);
        }

        inputField.value = quantity;
    });
});


document.querySelectorAll('#filtrar').forEach(button => {
    button.addEventListener('click', function (event) {
        const sortForm = document.getElementById('sortForm');


        document.querySelectorAll('#filtrar').forEach(button => {
            button.addEventListener('click', function (event) {
                const selectedCategory = document.getElementById('categorySelect').value;
                let newUrl = `?category=${selectedCategory}`;
                console.log(newUrl);
                window.location.href = newUrl;
            });
        });

        document.getElementById('sortForm').addEventListener('click', (event) => {
            const selectedSort = document.querySelector('input[name="exampleRadios"]:checked').value;
            const selectedCategory = document.getElementById('categorySelect').value;
            let newUrl = `?sort=${selectedSort}&category=${selectedCategory}`;
            console.log(newUrl);
            window.location.href = newUrl;
        });
    })
})







