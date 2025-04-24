<template>
    <div class="container">
        <div class="form-container">
          <div class="header-container">
            <img class="img-title" :src="logo" :alt="logo">
            <h2>SOLICITUD DE COTIZACIONES A COMPRAS</h2>
          </div>
          <!-- Botón redondo flotante -->
          <button class="round-button" @click="agregarRow">
              <i class="fa-solid fa-plus"></i>
          </button>
            <form @submit.prevent="" class="form-flex">
                <div v-for="(row, index) in rows" :key="index" class="row-group">
                    <div class="form-group">
                        <label>Referencia:</label>
                        <input type="text" class="input-field" v-model="row.referencia">
                    </div>
                    <div class="form-group">
                        <label>Producto:</label>
                        <input type="text" class="input-field" v-model="row.producto">
                    </div>
                    <div class="form-group">
                        <label>Proveedor:</label>
                        <input type="text" class="input-field" v-model="row.proveedor">
                    </div>
                    <div class="form-group">
                        <label>Marca:</label>
                        <input type="text" class="input-field" v-model="row.marca">
                    </div>
                    <button type="button" class="delete-button" @click="eliminarRow(index)">❌</button>
                </div>
                <hr>
                <div class="column-group">
                    <div class="form-group small-width">
                        <label>Negociador:</label>
                        <select class="input-field" v-model="negociador">
                            <option :value="null">Seleccione...</option>
                            <option v-for="neg in list_negociadores" :value="neg.usuario">{{ neg.des_usuario }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cuerpo del mensaje:</label>
                        <textarea class="input-field" v-model="cuerpo_texto"></textarea>
                    </div>
                    <button type="submit" class="submit-button align-start">Registrar Solicitud</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal de éxito -->
    <div class="modal fade" id="exitoModal" tabindex="-1" aria-labelledby="exitoModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="exitoModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exitoModalLabel">Modal Formación</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    {{ msg }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de error -->
    <div class="modal fade" id="errorModal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true" data-bs-backdrop="static" ref="errorModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="errorModalLabel">Error</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    {{ errorMsg }}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import apiUrl from "../../config.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Modal } from 'bootstrap';
import logo from "@/assets/logo.png";

const rows = ref([{ referencia: "", producto: "", proveedor: "", marca: "" }]);
const negociador = ref(null);
const cuerpo_texto = ref("");
const list_negociadores = ref([]);

const modalInstance = ref(null);
const modalErrorInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const mostrarErrores = ref(false);

const router = useRouter();

const cargarDatos = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/get_parametros`, {},
            {
                headers: {
                    Accept: "application/json",
                }
            }
        );
        console.log(response);
        if (response.status === 200) {
            list_negociadores.value = response.data.data
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response.data.message;
    }
};

function agregarRow() {
    rows.value.push({ referencia: "", producto: "", proveedor: "", marca: "" });
}

function eliminarRow(index) {
    rows.value.splice(index, 1);
}

// ✅ Función que redirige al a página principal
function redirigir_home() {
  router.push('/home'); // Redirigir al dashboard
};

// ✅ Función mounted que carga información ANTES de que la página renderice
onMounted(() => {
  modalInstance.value = new Modal(exitoModal);
  modalErrorInstance.value = new Modal(errorModal);

  cargarDatos();

});

</script>

<style scoped>

.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
}
.header, .form-container {
  background-color: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}
.header-container {
  display: flex;
  align-items: center;
}

/* Botón redondo */
.round-button {
    position: fixed;
    right: 30px;
    top: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #2778bf;
    color: white;
    border: none;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.round-button:hover {
    background-color: #4385be;
    transform: scale(1.1);
}

.img-title {
  width: 60px;
  height: 50px;
  margin-right: 10px;
}
.search-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}
.form-container h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}
.form-flex {
  display: flex;
  flex-direction: column; /* Asegura que las filas se apilen verticalmente */
  gap: 16px; /* Espaciado entre filas */
}
.form-group {
  flex: 1 1 33.3%; /* Cada campo ocupa el 33.3% del ancho */
  min-width: 150px; /* Evita que se vuelvan demasiado pequeños */
}

textarea.input-field {
  resize: none; /* Evita que el usuario cambie el tamaño del textarea */
}

.submit-button {
  flex: 1 1 33.3%; /* El botón también ocupa el 33.3% del ancho */
  align-self: flex-end; /* Alinea el botón al final */
  max-width: 150px; /* Limita el ancho máximo del botón */
}

.form-group:nth-child(2), /* Producto */
.form-group:nth-child(3) { /* Proveedor */
  flex: 2 1 40%; /* Ocupan más espacio proporcionalmente */
}

.form-group label {
  display: block;
  color: #4b5563;
  margin-bottom: 4px;
}

.custom-select {
position: relative;
width: 100%;
min-height: 37px;
border-radius: 4px;
padding: 10px;
border: 1px solid #ccc;
cursor: pointer;
background: white;
}
.selected-options {
display: flex;
flex-wrap: wrap;
gap: 2px;
font-size: 14px;
}

.selected {
  background-color: #5a4bbf;
  color: white;
  font-weight: bold;
  transition: 0.4s;
}

.selected:hover {
  background-color: #afa9da;
  color: white;
  font-weight: bold;
}

.input-field {
  width: 100%;
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
}

.submit-button {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  background: #2778bf;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 0.9em;
}

.submit-button:hover {
  background: #4385be;
}

.error .input-field,
.error select {
  border-color: red;
  background-color: #ffe6e6;
}

.error-text {
  color: red;
  font-size: 0.85em;
  margin-top: 4px;
}

.row-group {
  display: flex;
  flex-direction: row; /* Mantiene los elementos en la misma fila */
  gap: 16px;
  align-items: flex-end;
  width: 100%; /* Cada fila ocupa el ancho completo */
}

.column-group {
  display: flex;
  flex-direction: column; /* Coloca los elementos uno debajo del otro */
  gap: 16px; /* Espaciado entre los elementos */
  width: 100%; /* Ocupa todo el ancho disponible */
}

.form-group {
  width: 100%; /* Cada campo ocupa el ancho completo */
}

.form-group.small-width {
  width: 25%; /* Reduce el ancho del campo negociador */
}

textarea.input-field {
  resize: none; /* Evita que el usuario cambie el tamaño del textarea */
}

.submit-button {
  width: auto; /* Ajusta el ancho del botón al contenido */
  align-self: flex-start; /* Alinea el botón al inicio */
}

.delete-button {
  background: white;
  border: none;
  border-radius: 5px;
  padding: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.delete-button:hover {
  background: #ffc4c4;
}


@media (max-width: 768px) {
  .form-group {
      flex: 1 1 calc(50% - 16px); /* 2 columnas en pantallas medianas */
  }
}

@media (max-width: 480px) {
  .form-group {
      flex: 1 1 100%; /* 1 columna en pantallas pequeñas */
  }
}

</style>
