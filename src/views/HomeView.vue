<template>
    <div class="container">
      <div class="header-container">
        <img class="img-title" :src="logo" :alt="logo">
        <h2>SOLICITUD DE COTIZACIONES A COMPRAS</h2>
      </div>

      <!-- Acordeón de filtros -->
      <div class="accordion" id="filterAccordion">
          <div class="accordion-item" style="margin: 20px 20px;">
            <h2 class="accordion-header" id="headingFilters">
                <button 
                    class="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapseFilters" 
                    aria-expanded="false" 
                    aria-controls="collapseFilters"
                    >
                    Filtros
                </button>
            </h2>
            <div 
                id="collapseFilters" 
                class="accordion-collapse collapse" 
                aria-labelledby="headingFilters" 
                data-bs-parent="#filterAccordion"
            >
                <div class="accordion-body">
                    <div class="filter-container">
                      <div class="form-container">
                        <!-- Botón redondo flotante -->
                        <button class="round-button" @click="agregarRow">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                          <form @submit.prevent="guardar_solicitud" class="form-flex">
                              <div v-for="(row, index) in productos" :key="index" class="row-group">
                                  <div class="form-group">
                                      <label>Referencia:</label>
                                      <input type="text" class="input-field" v-model="row.referencia">
                                  </div>
                                  <div class="form-group">
                                      <label>Producto:</label>
                                      <input type="text" class="input-field" v-model="row.producto">
                                  </div>
                                  <div class="form-group">
                                      <label>Cantidad:</label>
                                      <input type="number" class="input-field" v-model="row.cantidad" required>
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
                                      <textarea 
                                        class="input-field" 
                                        v-model="cuerpo_texto" 
                                        @input="autoExpand($event)"
                                      ></textarea>
                                  </div>
                                  <button type="submit" class="submit-button align-start">Registrar Solicitud</button>
                              </div>
                          </form>
                      </div>
                        
                    </div>
                </div>
            </div>
          </div>
      </div>
          
    </div>

    <div class="container-n">
        <div class="table-container">
            <h3 class="h3-title">NÚMERO DE REGISTROS</h3>
            <table>
                <thead>
                    <tr>
                        <th># Id</th>
                        <th>Fecha de solicitud</th>
                        <th>Estado de solicitud</th>
                        <th>Solicitante</th>
                        <th>Negociador</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="lista_solicitudes.length === 0">
                        <td colspan="6" class="no-registros">No hay registros disponibles</td>
                    </tr>
                    <tr v-else v-for="sol in lista_solicitudes" :key="sol.id">
                        <td>{{ sol.id }}</td>
                        <td>{{ sol.created_at }}</td>
                        <td>{{ sol.estado_solicitud }}</td>
                        <td>{{ sol.usuario_creador_solicitud }}</td>
                        <td>{{ sol.negociador }}</td>
                        <td>
                            <i 
                                class="fa-solid fa-eye" 
                                style="cursor: pointer; color: #2778bf;" 
                                @click="mostrarDetalles(sol.detalles)"
                            ></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- <div class="pagination" v-if="total_registros > 15">
          <label for="records-per-page">Registros por página:</label>
          <select 
            id="records-per-page" 
            v-model="limit" 
            @change="changePage(1)"
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
          <button 
            :disabled="position <= 1" 
            @click="changePage(1)"
          >
            Primera
          </button>
          
          <button 
            :disabled="position <= 1" 
            @click="changePage(position - 1)"
          >
            Anterior
          </button>
          
          <span>Página {{ position }} de {{ total_paginas }}</span>
          
          <button 
            :disabled="position >= total_paginas" 
            @click="changePage(position + 1)"
          >
            Siguiente
          </button>
          
          <button 
            :disabled="position >= total_paginas" 
            @click="changePage(total_paginas)"
          >
            Última
          </button>
        </div> -->
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

    <!-- Modal para mostrar detalles -->
    <div class="modal fade" id="detallesModal" tabindex="-1" aria-labelledby="detallesModalLabel" aria-hidden="true" ref="detallesModal">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="detallesModalLabel">Detalles de la Solicitud</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" v-if="!detallesSolicitud || detallesSolicitud.length === 0">
                    <p>No hay detalles.</p>
                </div>
                <div class="modal-body" v-else>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Referencia</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Proveedor</th>
                                <th>Marca</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="detalle in detallesSolicitud" :key="detalle.id">
                                <td>{{ detalle.referencia }}</td>
                                <td>{{ detalle.producto }}</td>
                                <td>{{ detalle.cantidad }}</td>
                                <td>{{ detalle.proveedor }}</td>
                                <td>{{ detalle.marca }}</td>
                            </tr>
                        </tbody>
                    </table>
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

const productos = ref([{ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "" }]);
const negociador = ref(null);
const cuerpo_texto = ref("");
const list_negociadores = ref([]);
const lista_solicitudes = ref([]);

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalDetallesInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const detallesSolicitud = ref(""); // Almacena los detalles de la solicitud seleccionada

const router = useRouter();

const guardar_solicitud = async () => {

    try {
        const response = await axios.post(
            `${apiUrl}/guardar_solicitud`, 
            {
                lista_productos: productos.value,
                negociador: negociador.value,
                cuerpo_texto: cuerpo_texto.value,
            },
            {
                headers: {
                    Accept: "application/json",
                }
            }
        );
        if (response.status === 200) {
            msg.value = response.data.message;
            modalInstance.value.show();
            limpiarCampos();
            mostrarSolicitudes();
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response.data.message;
    }
};

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
        if (response.status === 200) {
            list_negociadores.value = response.data.data
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response.data.message;
    }
};

const mostrarSolicitudes = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/mostrar_solicitudes`, {},
            {
                headers: {
                    Accept: "application/json",
                }
            }
        );
        if (response.status === 200) {
            lista_solicitudes.value = response.data.data
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response.data.message;
    }
};

const limpiarCampos = () => {
    productos.value = [{ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "" }];
    negociador.value = null;
    cuerpo_texto.value = "";
};

function agregarRow() {
    productos.value.push({ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "" });
}

function eliminarRow(index) {
    productos.value.splice(index, 1);
}

// ✅ Función que redirige al a página principal
function redirigir_home() {
  router.push('/home'); // Redirigir al dashboard
};

// ✅ Función para expandir automáticamente el textarea
function autoExpand(event) {
  const textarea = event.target;
  textarea.style.height = "auto"; // Restablece la altura
  textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta la altura al contenido
}

// ✅ Función para mostrar los detalles en el modal
function mostrarDetalles(detalles) {
    detallesSolicitud.value = detalles;
    modalDetallesInstance.value.show();
}

// ✅ Función mounted que carga información ANTES de que la página renderice
onMounted(() => {
  modalInstance.value = new Modal(exitoModal);
  modalErrorInstance.value = new Modal(errorModal);
  modalDetallesInstance.value = new Modal(detallesModal);

  cargarDatos();
  mostrarSolicitudes();

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
  margin: 20px 20px;
  display: flex;
  align-items: center;
}

.accordion {
  margin-top: 1px;
}

.accordion-button{
    font-size: 14px;
    padding: 10px;
}

.accordion-body .filter-container h2 {
    font-size: 1.2rem;
}

/* Botón redondo */
.round-button {
    position: fixed;
    right: 30px;
    top: 130px;
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

.form-group:nth-child(2), /* Producto */
.form-group:nth-child(3) { /* Proveedor */
  flex: 2 1 40%; /* Ocupan más espacio proporcionalmente */
}

.form-group label {
  display: block;
  color: #4b5563;
  margin-bottom: 4px;
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

.container-n {
    width: 100%;
    height: calc(100vh - 120px); /* Ajusta la altura para que la tabla ocupe el espacio restante */
    padding: 16px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    align-self: center;
    overflow: hidden; /* Evita el scroll en toda la página */
}

.table-container {
    flex-grow: 1; /* Permite que la tabla ocupe todo el espacio restante */
    overflow-y: auto; /* Activa el scroll interno en la tabla */
    max-height: 100%; /* Se ajusta a la altura disponible */
}

table {
    width: 100%;
    border-collapse: collapse;

    position: relative;
}
/* Dejar fija la cabecera */
thead {
    position: sticky;
    top: 0;
    background-color: #e5e7eb; /* Fijar color de fondo para que no sea transparente */
    z-index: 10; /* Asegurar que esté sobre el contenido */
}
th, td {
    border: 1px solid #e5e7eb;
    padding: 8px;
    text-align: left;
    font-size: 0.75rem;
}
th {
    background-color: #e5e7eb;
}

.no-registros {
    text-align: center;
    font-weight: bold;
    color: #888;
    padding: 16px;
    font-size: 1rem;
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
