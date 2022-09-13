const productoDOM = document.querySelector(".productos_center")
const carritoDOM = document.querySelector(".carrito")
const  carritoCenter = document.querySelector(".carrito_center")
const openCarrito = document.querySelector(".carrito_icono")
const closeCarrito =document.querySelector(".close_carrito")
const  overlay = document.querySelector(".overlay")
const carritoTotal = document.querySelector(".carrito_total")
const clearCarritoBtn = document.querySelector(".clear_carrito")
const itemTotales = document.querySelector(".item_total")
const detalles =  document.getElementById("detalles")
const buscador = document.getElementById("buscar")

let  removerLibreria = document.querySelector(".remove_all")
let removerLibreriados = document.querySelector(".remove_alldos")

let carrito = [];
let buttomDOM = [];

class UI {

	detalleProducto(id){
		const filtroDato = productos.filter(item => item.id == id)
		let result = ""
		filtroDato.forEach(producto => {
			result += `
			<article class="detalles-grid">
				<img src=${producto.image} alt="${producto.title}" class="img-fluid">
				<div class="detalles-content">
					<h3>${producto.title}</h3>
					</div>
						<p class="price_detalles"><b>Precio: </b> $${producto.price}</p>
						<p class="description">
							
							<span>${producto.description}</span>
						</p>
						<p class="description">
							<span class="span_dos">${producto.medidas}</span>
						</p>

						<div class="bottom_detalles">
							<div class="btn__group">
								<button class="btn addToCart " data-id=${producto.id}>Añadir carrito</button>
							</div>
						</div>
				</div>
			</article>
			`
		});
		detalles.innerHTML = result;
	}

	renderProductos(productos){
		let result = ""
		productos.forEach((producto) =>{
			result += `
			<div class="contenedor_producto">
			<div class="imagen_producto">
			<img src=${producto.image} alt="">
		</div>
          <div class="descripcion__footer">
            <h1>${producto.title}</h1>
            
            <div class="price">$${producto.price}</div>
          </div>
          <div class="bottom">
            <div class="btn__group">
              <button class="btn addToCart" data-id=${producto.id}>Añadir carrito</button>
              <a href="productos-detalles.html?id=${producto.id}" class="btn view">Vista</a>
            </div>
          </div>
        </div>
				`
		});
		productoDOM.innerHTML = result
	}

	getButtons(){
		const buttons = [...document.querySelectorAll(".addToCart")];
		buttomDOM = buttons;
		buttons.forEach((button)=> {
			const id = button.dataset.id;
			const inCart = carrito.find(item => item.id === parseInt(id, 10));

			if(inCart){
				button.innerHTML = "En el carrito";
				button.disabled = true;
			}
			button.addEventListener("click", e =>{
				e.preventDefault();
				e.target.innerHTML = "En el carrito";
				e.target.disabled = true;
				

				// GET productos al carrito
				const carritoItem = {...Storage.getProductos(id), cantidad: 1}

				//agregamos el producto al carrito
				carrito = [...carrito, carritoItem]

				//Guardamos el carrito al localstorage
				Storage.saveCart(carrito)

				//Set cart values
				this.setItemValues(carrito)
				this.addCarritoItem(carritoItem)
				//Show al carrito
			})
		})
	}

	setItemValues(carrito){
		let tempTotal = 0;
		let itemTotal = 0;
		carrito.map(item => {
			tempTotal += item.price * item.cantidad;
			itemTotal += item.cantidad;
		});
		carritoTotal.innerText = parseFloat(tempTotal.toFixed(2));
		itemTotales.innerText = itemTotal
	}

	addCarritoItem({image, price, title, id}){
		const div = document.createElement("div")
		div.classList.add("imagen_producto")

		div.innerHTML = `
		<img src=${image} alt=${title}>
		<div>
			<h3>${title}</h3>
			<p class="price">$${price}</p>
		</div>
		<div>
			<span class="increase" data-id=${id}>
				<i class="bx bxs-up-arrow"></i>
			</span>
			<p class="p_cantidad">1</p>
			<span class="decrease" data-id=${id}>
				<i class="bx bxs-down-arrow"></i>
			</span>
		</div>
		<div>
			<span class="remove__item" data-id=${id}>
				<i class="bx bx-trash"></i>
			</span>
		</div>
		`
		carritoCenter.appendChild(div)
	}
	show(){
		carritoDOM.classList.add("show")
		overlay.classList.add("show")
	}
	hide(){
		carritoDOM.classList.remove("show")
		overlay.classList.remove("show")
	}
	setAPP(){
		carrito = Storage.getCart()
		this.setItemValues(carrito)
		this.populate(carrito)
		openCarrito.addEventListener("click", this.show)
		closeCarrito.addEventListener("click", this.hide)
	}
	populate(carrito){
		carrito.forEach(item => this.addCarritoItem(item))
	}
	cartLogic(){
		clearCarritoBtn.addEventListener("click", () =>{
			this.clearCarrito()
			this.hide()
		});

		carritoCenter.addEventListener("click", e =>{
			const target = e.target.closest("span")
			const targetElement = target.classList.contains("remove__item");
			console.log(target)
			console.log(targetElement)
			if(!target) return
			if(targetElement){
				const id = parseInt(target.dataset.id);
				this.removeItem(id)
				carritoCenter.removeChild(target.parentElement.parentElement)
			}else if(target.classList.contains("increase")){
				const id = parseInt(target.dataset.id, 10);
				let tempItem = carrito.find(item => item.id === id);
				tempItem.cantidad++;
				Storage.saveCart(carrito)
				this.setItemValues(carrito)
				target.nextElementSibling.innerText = tempItem.cantidad
			}else if(target.classList.contains("decrease")){
				const id = parseInt(target.dataset.id, 10);
				let tempItem = carrito.find(item => item.id === id);
				tempItem.cantidad--;

				if(tempItem.cantidad > 0){
					Storage.saveCart(carrito);
					this.setItemValues(carrito);
					target.previousElementSibling.innerText = tempItem.cantidad;
				}else{
					this.removeItem(id);
					carritoCenter.removeChild(target.parentElement.parentElement)
				}
			}
		});
	}
	clearCarrito(){
		const cartItems = carrito.map(item => item.id)
		cartItems.forEach(id => this.removeItem(id))

		while(carritoCenter.children.length > 0){
			carritoCenter.removeChild(carritoCenter.children[0])
		}
	}
	removeItem(id){
		carrito = carrito.filter(item => item.id !== id);
		this.setItemValues(carrito)
		Storage.saveCart(carrito)
		let button = this.singleButton(id);
		if(button){
			button.disabled = false;
			button.innerText = "Añadir carrito"
		}
	}
	singleButton(id){
		return buttomDOM.find(button => parseInt(button.dataset.id) === id)
	}
}



class Storage {
	static saveProduct(obj){
		localStorage.setItem("productos", JSON.stringify(obj))
	}
	static saveCart(carrito){
		localStorage.setItem("carrito", JSON.stringify(carrito))
	}
	static getProductos(id){
		const producto = JSON.parse(localStorage.getItem("productos"))
		return producto.find(product =>product.id === parseFloat(id, 10))
	}
	static getCart(){
		return localStorage.getItem("carrito") ? JSON.parse(localStorage.getItem("carrito")) : [];
	}
}

class Productos {
  async getProductos() {
    try {
			const result = await fetch("productos.json")
			const data = await result.json()
			const productos = data.items
			return productos
		}catch(err){
			console.log(err)
		}
  }
}

let category = "";
let productos  = [];

function categoryValue(){
	const ui = new UI();

	category = document.getElementById("category").value
	if(category.length > 0){
		const producto = productos.filter(regx => regx.category === category)
		ui.renderProductos(producto)
		ui.getButtons();
	}else{
		ui.renderProductos(productos)
		ui.getButtons();
	
	}
}


const query = new URLSearchParams(window.location.search)
let id = query.get('id')

document.addEventListener("DOMContentLoaded", async () =>{
	const productosLista = new Productos();
	const ui = new UI();

	ui.setAPP()

	productos = await productosLista.getProductos()
	if(id){
		ui.detalleProducto(id)
		Storage.saveProduct(productos)
		ui.getButtons();
		ui.cartLogic();
	}else{
		ui.renderProductos(productos)
		Storage.saveProduct(productos)
		ui.getButtons();
		ui.cartLogic();
	}
})

const  alerta =  () => {
    Toastify({
        text: "Removiste todo el carrito.",
		offset: {
			x: 10, 
			y: 10 
		},
        duration:1000,
        position: "left",
        className: "info",
        style: {
        background: "linear-gradient(to right,  #96c93d)",
        }
    }).showToast();
}

removerLibreria.addEventListener("click",alerta)







