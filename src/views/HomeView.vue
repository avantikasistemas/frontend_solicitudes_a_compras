<template>
    <div class="container">
      <div class="header-container">
        <img class="img-title" :src="logo" :alt="logo">
        <h2>SOLICITUD DE COTIZACIONES A COMPRAS</h2>
      </div>

      <!-- Acordeón de productos -->
      <div class="accordion" id="productosAccordion">
          <div class="accordion-item" style="margin: 20px 20px;">
            <h2 class="accordion-header" id="headingProductos">
                <button 
                    class="accordion-button collapsed" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#collapseProductos" 
                    aria-expanded="false" 
                    aria-controls="collapseProductos"
                    >
                    Productos
                </button>
            </h2>
            <div 
                id="collapseProductos" 
                class="accordion-collapse collapse" 
                aria-labelledby="headingProductos" 
                data-bs-parent="#productosAccordion"
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
                                      <label>Descripción:</label>
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
                                      <select class="input-field" v-model="negociador" required>
                                          <option :value="null">Seleccione...</option>
                                          <option v-for="neg in list_negociadores" :value="neg.usuario">{{ neg.des_usuario }}</option>
                                      </select>
                                  </div>
                              </div>
                              <div class="column-group">
                                  <div class="form-group">
                                      <label>Cuerpo del mensaje:</label>
                                      <textarea 
                                        class="input-field" 
                                        v-model="cuerpo_texto" 
                                        @input="autoExpand($event)"
                                        ref="textarea"
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
                          <form @submit.prevent="" class="form-flex">
                              <div class="row-group">
                                  <div class="form-group">
                                      <label>Id de solicitud:</label>
                                      <input type="number" class="input-field" v-model="filtro_id_solicitud">
                                  </div>
                                  <div class="form-group">
                                    <label>Estado de Solicitud:</label>
                                    <select class="input-field" v-model="filtro_estado_solicitud">
                                        <option :value="null">Seleccione...</option>
                                        <option v-for="est in lista_estados_solicitud" :value="est.id">{{ est.nombre }}</option>
                                    </select>
                                  </div>
                                  <div class="form-group">
                                      <label>Solicitante:</label>
                                      <select class="input-field" v-model="filtro_solicitante">
                                          <option :value="null">Seleccione...</option>
                                          <option v-for="soli in list_solicitantes" :value="soli.usuario">{{ soli.nombre }}</option>
                                      </select>
                                  </div>
                                  <div class="form-group">
                                    <label>Negociador:</label>
                                    <select class="input-field" v-model="filtro_negociador">
                                        <option :value="null">Seleccione...</option>
                                        <option v-for="neg in list_negociadores" :value="neg.usuario">{{ neg.des_usuario }}</option>
                                    </select>
                                  </div>
                              </div>
                              <div class="row-group">
                                <button type="submit" class="submit-button align-start" @click="mostrarSolicitudes">Consultar</button>
                                <button type="submit" class="clean-button align-start" @click="limpiarCamposFiltro">Limpiar</button>
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
            <h3 class="h3-title">REGISTROS</h3>
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
                        <td>{{ sol.estado_solicitud_nombre }}</td>
                        <td>{{ sol.usuario_nombre }}</td>
                        <td>{{ sol.negociador_nombre }}</td>
                        <td>
                            <i 
                                class="fa-solid fa-eye" 
                                style="cursor: pointer; color: #2778bf;" 
                                @click="mostrarDetalles(sol.detalles, sol.cuerpo_texto)"
                            ></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="pagination" v-if="total_registros > 15">
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
                <div class="modal-footer" v-if="token_status===401">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="logout">Cerrar</button>
                </div>
                <div class="modal-footer" v-else-if="token_status===403">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
                <div class="modal-footer" v-else>
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
                                <th>Descripción</th>
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
                    <p>{{cuerpoTexto}}</p>
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

const token = ref("");
const usuario_creador = ref("");

const productos = ref([{ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "" }]);
const negociador = ref(null);
const cuerpo_texto = ref("");
const list_negociadores = ref([]);
const list_solicitantes = ref([]);
const lista_solicitudes = ref([]);
const lista_estados_solicitud = ref([]);

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalDetallesInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const detallesSolicitud = ref("");
const cuerpoTexto = ref("");
const textarea = ref(null);

const filtro_id_solicitud = ref("");
const filtro_estado_solicitud = ref(null);
const filtro_solicitante = ref("");
const filtro_negociador = ref(null);

const total_paginas = ref(0);
const total_registros = ref(0);
const limit = ref(15);
const position = ref(1);

const token_status = ref(0);

const router = useRouter();

const guardar_solicitud = async () => {

    try {
        const response = await axios.post(
            `${apiUrl}/guardar_solicitud`, 
            {
                lista_productos: productos.value,
                solicitante: usuario_creador.value,
                negociador: negociador.value,
                cuerpo_texto: cuerpo_texto.value,
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
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
        if (error.response.status === 401) {
          token_status.value = error.response.status;
          errorMsg.value = error.response.data.detail;
        } else if (error.response.status === 403) {
            token_status.value = error.response.status;
            errorMsg.value = error.response.data.detail;
        }
    }
};

const cargarDatos = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/get_parametros`, {},
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
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

const cargarSolicitantes = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/get_personal_cotizaciones`, {},
            {
                headers: {
                    Accept: "application/json",
                }
            }
        );
        if (response.status === 200) {
            list_solicitantes.value = response.data.data
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
            `${apiUrl}/mostrar_solicitudes`, 
            {
                solicitud_id: filtro_id_solicitud.value,
                estado_solicitud: filtro_estado_solicitud.value,
                solicitante: filtro_solicitante.value,
                negociador: filtro_negociador.value,
                limit: parseInt(limit.value),
                position: parseInt(position.value),
            },
            {
                headers: {
                    Accept: "application/json"
                }
            }
        );
        if (response.status === 200) {
            lista_solicitudes.value = response.data.data.registros;
            total_paginas.value = response.data.data.total_pag;
            total_registros.value = response.data.data.total_registros;
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response.data.message;
    }
}

const mostrarEstadosSolicitud = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/get_estados_solicitud`, {},
            {
                headers: {
                    Accept: "application/json",
                }
            }
        );
        if (response.status === 200) {
            lista_estados_solicitud.value = response.data.data
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response.data.message;
    }
};

const changePage = async (newPosition) => {
  position.value = newPosition;
  await mostrarSolicitudes(); // Vuelve a cargar los datos con el nuevo límite y posición
};

const limpiarCampos = () => {
    productos.value = [{ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "" }];
    negociador.value = null;
    cuerpo_texto.value = "";

    // Restablece el tamaño del textarea usando el ref
    if (textarea.value) {
        textarea.value.style.height = "auto"; // vuelve al tamaño original
    }
};

const limpiarCamposFiltro = async () => {
  filtro_id_solicitud.value = "";
  filtro_estado_solicitud.value = null;
  filtro_solicitante.value = null;
  filtro_negociador.value = null;
  await mostrarSolicitudes();
};

function agregarRow() {
    productos.value.push({ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "" });
};

function eliminarRow(index) {
    productos.value.splice(index, 1);
};

// ✅ Función para expandir automáticamente el textarea
function autoExpand(event) {
  const textarea = event.target;
  textarea.style.height = "auto"; // Restablece la altura
  textarea.style.height = `${textarea.scrollHeight}px`; // Ajusta la altura al contenido
};

// ✅ Función para mostrar los detalles en el modal
function mostrarDetalles(detalles, cuerpo_texto) {
    detallesSolicitud.value = detalles;
    cuerpoTexto.value = cuerpo_texto;
    modalDetallesInstance.value.show();
};

function logout() {
  localStorage.clear();
  router.push('/'); // Redirigir al login
};

// ✅ Función mounted que carga información ANTES de que la página renderice
onMounted(() => {
  token.value = localStorage.getItem("token");
  usuario_creador.value = localStorage.getItem("usuario_creador");

  modalInstance.value = new Modal(exitoModal);
  modalErrorInstance.value = new Modal(errorModal);
  modalDetallesInstance.value = new Modal(detallesModal);

  if (!token.value) {
      router.push('/'); // Redirigir al login si no hay token
  }

  cargarDatos();
  cargarSolicitantes();
  mostrarEstadosSolicitud();
  mostrarSolicitudes();

});

</script>

<style scoped>

.container {
  max-width: 80%;
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
.header-container h2{
  font-size: 1.3rem;
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

.clean-button {
  margin-top: 10px;
  padding: 10px;
  background: #940404;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
  font-size: 0.9em;
}

.clean-button:hover {
  background: #f84f4f;
}

.container-n {
    width: 80%; /* Igual que el contenedor superior */
    margin: 0 auto; /* Centra horizontalmente el contenedor */
    height: calc(100vh - 120px); /* Ajusta la altura para que la tabla ocupe el espacio restante */
    padding: 16px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    align-self: center;
    overflow: hidden; /* Evita el scroll en toda la página */
}

.h3-title{
  font-size: 1.3rem;
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
th {
    background-color: #2778bf; /* Nuevo color para el encabezado de la tabla */
    color: white; /* Asegura que el texto sea legible */
}

.modal-body table th {
    background-color: #2778bf; /* Nuevo color para el encabezado de la tabla dentro del modal */
    color: white; /* Asegura que el texto sea legible */
}

th, td {
    border: 1px solid #e5e7eb;
    padding: 8px;
    text-align: center; /* Centra el texto en la cabecera y las filas */
    font-size: 0.75rem;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  gap: 2px;
  font-size: 142px; /* Reduce el tamaño de la fuente */
  padding: 78px;
}

.pagination label {
  margin-right: 10px;
  font-size: 1rem;
}

.pagination select {
  margin-right: 20px;
  padding: 4px;
  font-size: 0.8rem;
  height: 30px;
}

.pagination button {
  background-color: #2778bf;
  color: white;
  border: none;
  padding: 4px 8px;
  margin: 0 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 13px;
  height: 30px;
  transition: background 0.3s;
}

.pagination button:hover {
  background-color: #4385be;
}


.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.pagination span {
  margin: 0 10px;
  font-size: 1rem;
}

.modal-body p {
  word-wrap: break-word; /* Permite que las palabras largas se dividan en varias líneas */
  overflow-wrap: break-word; /* Asegura que el texto se ajuste al contenedor */
  white-space: pre-wrap; /* Mantiene los saltos de línea y ajusta el texto al ancho del contenedor */
}

.modal-body {
    max-height: 400px; /* Limita la altura máxima del contenido */
    overflow-y: auto; /* Activa el scroll vertical si el contenido excede la altura */
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
