<template>
    <div class="container">
      <div class="header-container">
        <div class="header-left">
          <img class="img-title" :src="logo" :alt="logo">
          <h2>SOLICITUDES - MACROPROCESO DE ABASTECIMIENTO</h2>
        </div>
        <button class="logout-button" @click="confirmLogout">Cerrar sesión</button>
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
                                        <option v-for="est in lista_estados_solicitud" :key="est.id" :value="est.id">{{ est.nombre }}</option>
                                    </select>
                                  </div>
                                  <div class="form-group">
                                      <label>Solicitante:</label>
                                      <select class="input-field" v-model="filtro_solicitante">
                                          <option :value="null">Seleccione...</option>
                                          <option v-for="soli in list_solicitantes" :key="soli.usuario" :value="soli.usuario">{{ soli.nombre }}</option>
                                      </select>
                                  </div>
                                  <!-- Ocultar filtro de negociadores si el usuario es negociador (no admin) -->
                                  <div v-if="!es_negociador_usuario" class="form-group" style="position: relative;">
                                    <label>Negociador(es):</label>
                                    <div 
                                      class="custom-multiselect" 
                                      @click="mostrar_dropdown_negociadores_filtro = !mostrar_dropdown_negociadores_filtro"
                                      style="cursor: pointer;"
                                    >
                                      <div class="selected-items">
                                        <span v-if="filtro_negociador.length === 0" class="placeholder">Seleccione negociadores...</span>
                                        <span v-else class="selected-count">{{ filtro_negociador.length }} seleccionado(s)</span>
                                      </div>
                                      <i class="fa-solid fa-chevron-down" :class="{ 'rotated': mostrar_dropdown_negociadores_filtro }"></i>
                                    </div>
                                    
                                    <!-- Dropdown de negociadores -->
                                    <div v-if="mostrar_dropdown_negociadores_filtro" class="negociadores-dropdown" @click.stop>
                                      <div 
                                        v-for="neg in list_negociadores" 
                                        :key="neg.usuario"
                                        class="negociador-item"
                                        @click="toggleNegociadorFiltro(neg.usuario)"
                                      >
                                        <input 
                                          type="checkbox" 
                                          :checked="filtro_negociador.includes(neg.usuario)"
                                          @click.stop="toggleNegociadorFiltro(neg.usuario)"
                                        >
                                        <label>{{ neg.nombre }}</label>
                                      </div>
                                    </div>
                                  </div>
                              </div>
                              <div class="row-group">
                                  <div class="form-group">
                                      <label>Fecha Desde:</label>
                                      <input type="date" class="input-field" v-model="filtro_fecha_desde">
                                  </div>
                                  <div class="form-group">
                                      <label>Fecha Hasta:</label>
                                      <input type="date" class="input-field" v-model="filtro_fecha_hasta">
                                  </div>
                              </div>
                              <div class="row-group">
                                <button type="submit" class="submit-button align-start" @click="mostrarSolicitudes">Consultar</button>
                                <button type="submit" class="clean-button align-start" @click="limpiarCamposFiltro">Limpiar</button>
                                <div style="margin-left: auto; display: flex; gap: 10px;">
                                  <button 
                                    type="button" 
                                    class="fan-toggle-button"
                                    :class="{ 'fan-toggle-active': filtro_fan === true }"
                                    @click="toggleFiltroFan(true)"
                                  >
                                    <i class="fa-solid fa-star"></i> Cliente Fan
                                  </button>
                                  <button 
                                    type="button" 
                                    class="fan-toggle-button fan-toggle-nofan"
                                    :class="{ 'fan-toggle-active-nofan': filtro_fan === false }"
                                    @click="toggleFiltroFan(false)"
                                  >
                                    <i class="fa-regular fa-star"></i> Cliente no Fan
                                  </button>
                                </div>
                              </div>                      
                          </form>
                      </div>
                        
                    </div>
                </div>
            </div>
          </div>
      </div>
    </div>

    <!-- Dashboard de KPIs -->
    <div class="dashboard-kpis">
        <div class="kpi-card kpi-total">
            <div class="kpi-icon"><i class="fa-solid fa-inbox"></i></div>
            <div class="kpi-info">
                <span class="kpi-valor">{{ kpi_total }}</span>
                <span class="kpi-label">Total Recibidas</span>
            </div>
        </div>
        <div class="kpi-card kpi-nuevas">
            <div class="kpi-icon"><i class="fa-solid fa-bell"></i></div>
            <div class="kpi-info">
                <span class="kpi-valor">{{ kpi_nuevas }}</span>
                <span class="kpi-label">Nuevas</span>
            </div>
        </div>
        <div class="kpi-card kpi-proceso">
            <div class="kpi-icon"><i class="fa-solid fa-spinner"></i></div>
            <div class="kpi-info">
                <span class="kpi-valor">{{ kpi_en_proceso }}</span>
                <span class="kpi-label">En Proceso</span>
            </div>
        </div>
        <div class="kpi-card kpi-resueltas">
            <div class="kpi-icon"><i class="fa-solid fa-circle-check"></i></div>
            <div class="kpi-info">
                <span class="kpi-valor">{{ kpi_resueltas }}</span>
                <span class="kpi-label">Resueltas</span>
            </div>
        </div>
        <div class="kpi-card kpi-porcentaje">
            <div class="kpi-gauge">
                <svg viewBox="0 0 120 70" class="gauge-svg">
                    <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#ffb300"/>
                            <stop offset="100%" style="stop-color:#28a745"/>
                        </linearGradient>
                    </defs>
                    <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#e9ecef" stroke-width="12" stroke-linecap="round"/>
                    <path
                        d="M10 60 A50 50 0 0 1 110 60"
                        fill="none"
                        stroke="url(#gaugeGrad)"
                        stroke-width="12"
                        stroke-linecap="round"
                        :stroke-dasharray="`${(parseFloat(kpi_pct_resueltas) / 100) * 157} 157`"
                    />
                </svg>
                <span class="gauge-value">{{ kpi_pct_resueltas }}%</span>
            </div>
            <span class="kpi-label">% Resueltas</span>
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
                        <th>Tercero</th>
                        <th>Negociador</th>
                        <th>Porcentaje Solicitud</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="lista_solicitudes.length === 0">
                        <td colspan="8" class="no-registros">No hay registros disponibles</td>
                    </tr>
                    <tr v-else v-for="sol in lista_solicitudes" :key="sol.id" :class="{ 'solicitud-fan': sol.fan }">
                        <td>{{ sol.id }}</td>
                        <td>{{ sol.created_at }}</td>
                        <td>{{ sol.estado_solicitud_nombre }}</td>
                        <td>{{ sol.usuario_nombre }}</td>
                        <td>
                            <i v-if="sol.fan" class="fa-solid fa-star" style="color: #FFD700; margin-right: 4px;" title="Cliente Fan"></i>
                            {{ sol.tercero_nombre || 'N/A' }}
                        </td>
                        <td>{{ sol.negociador_nombre }}</td>
                        <td>{{ sol.porcentaje_solicitud }}%</td>
                        <td>
                            <i 
                                class="fa-solid fa-eye action-icon" 
                                style="color: #ffc300;" 
                                @click="mostrarDetalles(sol.detalles, sol.cuerpo_texto, sol.asunto, sol.id, sol.estado_solicitud, sol.fecha_resuelto, sol.comentario_resuelto)"
                                title="Ver detalles"
                            ></i>
                            <i 
                                class="fa-solid fa-file-lines action-icon" 
                                style="color: #28a745;" 
                                @click="mostrarHistorico(sol.historico)"
                                title="Ver histórico"
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
                    <h5 class="modal-title" id="exitoModalLabel">Modal</h5>
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
        <div class="modal-dialog modal-dialog-centered modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="detallesModalLabel">{{asuntoTexto}}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="resetCamposModal"></button>
                </div>
                <div class="modal-body" v-if="!detallesSolicitud || detallesSolicitud.length === 0">
                    <p>No hay detalles.</p>
                </div>
                <div class="modal-body" v-else>
                    <!-- Control masivo + guardado masivo -->
                    <div v-if="estadoSolicitud !== 4" class="bulk-controls">
                        <div class="bulk-radio-group">
                            <span class="bulk-label">Marcar todos como cotizado:</span>
                            <label class="radio-label-inline">
                                <input type="radio" name="cotizado-bulk" :value="1" v-model="seleccionarTodoCotizado"> Sí
                            </label>
                            <label class="radio-label-inline">
                                <input type="radio" name="cotizado-bulk" :value="0" v-model="seleccionarTodoCotizado"> No
                            </label>
                        </div>
                        <button class="actualizar-masivo-button" @click="guardarMasivoDetalles" :disabled="isLoading">
                            <span v-if="isLoading" class="spinner-sm"></span>
                            <i v-else class="fa-solid fa-floppy-disk" style="margin-right: 5px;"></i>
                            Guardar Todo
                        </button>
                    </div>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Referencia</th>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Proveedor</th>
                                <th>Marca</th>
                                <th>Cotizado</th>
                                <th>Negociador</th>
                                <th>Actualizar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(detalle, idx) in detallesSolicitud" :key="detalle.id">
                                <td>{{ idx + 1 }}</td>
                                <td>{{ detalle.referencia }}</td>
                                <td>{{ detalle.producto }}</td>
                                <td>{{ detalle.cantidad }}</td>
                                <td>{{ detalle.proveedor }}</td>
                                <td>{{ detalle.marca }}</td>
                                <td>
                                    <!-- Solo texto si está resuelto -->
                                    <span v-if="estadoSolicitud === 4">{{ detalle.cotizado === 1 ? 'Sí' : 'No' }}</span>
                                    <!-- Radio buttons editables si no está resuelto -->
                                    <div v-else class="radio-cotizado">
                                        <label class="radio-label">
                                            <input 
                                                type="radio" 
                                                :name="'cotizado-' + detalle.id"
                                                :value="1" 
                                                v-model.number="detalle.cotizado"
                                            > Sí
                                        </label>
                                        <label class="radio-label">
                                            <input 
                                                type="radio" 
                                                :name="'cotizado-' + detalle.id"
                                                :value="0" 
                                                v-model.number="detalle.cotizado"
                                            > No
                                        </label>
                                    </div>
                                </td>
                                <td>
                                    <!-- Solo texto si está resuelto -->
                                    <span v-if="estadoSolicitud === 4">{{ obtenerNombreNegociador(detalle.negociador) }}</span>
                                    <!-- Select editable si no está resuelto -->
                                    <select 
                                        v-else
                                        class="form-select form-select-sm"
                                        style="width: 150px;"
                                        v-model="detalle.negociador"
                                    >
                                        <option :value="null">Seleccione...</option>
                                        <option v-for="neg in list_negociadores" :key="neg.usuario" :value="neg.usuario">{{ neg.nombre }}</option>
                                    </select>
                                </td>
                                <td>
                                    <i 
                                        v-if="estadoSolicitud !== 4"
                                        class="fa-solid fa-arrows-rotate" 
                                        style="cursor: pointer; color: #007bff;"
                                        title="Actualizar"
                                        @click="actualizarDetalleCompleto(detalle)" 
                                    ></i>
                                    <span v-else style="color: #6c757d;">-</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p>{{cuerpoTexto}}</p>
                    <hr>
                    <!-- Mostrar detalles de resuelto si el estado es 4 -->
                    <div v-if="estadoSolicitud === 4">
                        <p><strong>Fecha de Resuelto:</strong> {{ fechaResuelto }}</p>
                        <p><strong>Mensaje de Resuelto:</strong> {{ mensajeResuelto }}</p>
                    </div>
                    <!-- Mostrar opciones de actualización si el estado no es 4 -->
                    <div v-else>
                        <!-- Nueva fila para seleccionar y actualizar negociador -->
                        <!-- <div class="row-group">
                            <div class="form-group small-width">
                                <label for="negociadorSelect">Negociador:</label>
                                <select id="negociadorSelect" class="input-field" v-model="nuevoNegociador">
                                    <option :value="null">Seleccione...</option>
                                    <option v-for="neg in list_negociadores" :key="neg.usuario" :value="neg.usuario">{{ neg.nombre }}</option>
                                </select>
                            </div>
                            <button 
                                class="actualizar-negociador-button align-start" 
                                @click="actualizarNegociador()"
                            >
                                Actualizar Negociador
                            </button>
                        </div>
                        <hr> -->
                        <!-- Nueva fila para seleccionar y actualizar estado -->
                        <div class="row-group">
                            <div class="form-group small-width">
                                <label for="estadoSelect">Estado:</label>
                                <select id="estadoSelect" class="input-field" v-model="nuevoEstado" @change="handleEstadoChange">
                                    <option :value="null">Seleccione...</option>
                                    <option v-for="estado in lista_estados_solicitud" :key="estado.id" :value="estado.id">{{ estado.nombre }}</option>
                                </select>
                            </div>
                            <button 
                                class="actualizar-estado-button align-start" 
                                @click="actualizarEstado()"
                                :disabled="isLoadingEstado"
                            >
                                <span v-if="isLoadingEstado" class="spinner-sm"></span>
                                <i v-else class="fa-solid fa-rotate" style="margin-right: 5px;"></i>
                                {{ isLoadingEstado ? 'Actualizando...' : 'Actualizar Estado' }}
                            </button>
                        </div>
                        <!-- Campos adicionales para estado "Resuelto" -->
                        <div v-if="nuevoEstado === 4" class="column-group">
                            <div class="form-group">
                                <label for="fechaResuelto">Fecha de Resuelto:</label>
                                <input type="date" id="fechaResuelto" class="input-field" v-model="fechaResuelto" required>
                            </div>
                            <div class="form-group">
                                <label for="mensajeResuelto">Mensaje de Resuelto:</label>
                                <textarea id="mensajeResuelto" class="input-field" v-model="mensajeResuelto" required></textarea>
                            </div>
                        </div>
                    </div>      
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="resetCamposModal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para mostrar histórico -->
    <div class="modal fade" id="historicoModal" tabindex="-1" aria-labelledby="historicoModalLabel" aria-hidden="true" ref="historicoModal">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="historicoModalLabel">Histórico de la Solicitud</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <ul v-if="historicoSolicitud.length > 0">
                        <li v-for="(item, index) in historicoSolicitud" :key="index">
                            <strong>{{ item.fecha }}:</strong> {{ item.descripcion }}
                        </li>
                    </ul>
                    <p v-else>No hay datos en el histórico.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de confirmación de cierre de sesión -->
    <div class="modal fade" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true" ref="logoutModal">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="logoutModalLabel">Confirmar cierre de sesión</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    ¿Está seguro de que desea cerrar sesión?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" @click="logout">Cerrar sesión</button>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import apiUrl from "../../config.js";
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Modal } from 'bootstrap';
import logo from "@/assets/logo.png";

const token = ref("");
const usuario_creador = ref("");
const es_negociador_usuario = ref(false);
const token_status = ref(0);

const solicitudId = ref(null);
const asuntoTexto = ref("");
const list_negociadores = ref([]);
const list_solicitantes = ref([]);
const lista_solicitudes = ref([]);
const lista_estados_solicitud = ref([]);

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalDetallesInstance = ref(null);
const historicoModalInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const detallesSolicitud = ref("");
const cuerpoTexto = ref("");
const logoutModalInstance = ref(null);
const historicoSolicitud = ref([]);

const filtro_id_solicitud = ref("");
const filtro_estado_solicitud = ref(null);
const filtro_solicitante = ref(null);
const filtro_negociador = ref([]);
const anioActual = new Date().getFullYear();
const filtro_fecha_desde = ref(`${anioActual}-01-01`);
const filtro_fecha_hasta = ref(`${anioActual}-12-31`);
const filtro_fan = ref(null);
const mostrar_dropdown_negociadores_filtro = ref(false);

const total_paginas = ref(0);
const total_registros = ref(0);
const limit = ref(15);
const position = ref(1);

const isLoading = ref(false);
const isLoadingEstado = ref(false);

// ── Indicadores / Dashboard ──
const indicadores = ref([]);

const kpi_total = computed(() =>
    indicadores.value.reduce((acc, i) => acc + i.total, 0)
);
const kpi_nuevas = computed(() =>
    indicadores.value
        .filter(i => i.estado_nombre.toLowerCase().includes('nueva') || i.estado_nombre.toLowerCase().includes('nuevo'))
        .reduce((acc, i) => acc + i.total, 0)
);
const kpi_resueltas = computed(() =>
    indicadores.value
        .filter(i => i.estado_id === 4)
        .reduce((acc, i) => acc + i.total, 0)
);
const kpi_en_proceso = computed(() => kpi_total.value - kpi_nuevas.value - kpi_resueltas.value);
const kpi_pct_resueltas = computed(() =>
    kpi_total.value > 0 ? ((kpi_resueltas.value / kpi_total.value) * 100).toFixed(1) : '0.0'
);

const nuevoNegociador = ref(null);
const nuevoEstado = ref(null);
const fechaResuelto = ref(null);
const mensajeResuelto = ref("");
const estadoSolicitud = ref(null);
const seleccionarTodoCotizado = ref(null);

// Watcher: cambia el cotizado de TODOS los detalles al seleccionar el radio masivo
watch(seleccionarTodoCotizado, (valor) => {
    if (valor !== null && detallesSolicitud.value && detallesSolicitud.value.length > 0) {
        detallesSolicitud.value = detallesSolicitud.value.map(d => ({ ...d, cotizado: valor }));
    }
});

const router = useRouter();

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
        if (error.response.status === 401) {
          token_status.value = error.response.status;
          errorMsg.value = error.response.data.detail;
        } else if (error.response.status === 403) {
            token_status.value = error.response.status;
            errorMsg.value = error.response.data.detail;
        }
    }
};

const cargarSolicitantes = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/get_personal_cotizaciones`, {},
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
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
        if (error.response.status === 401) {
          token_status.value = error.response.status;
          errorMsg.value = error.response.data.detail;
        } else if (error.response.status === 403) {
            token_status.value = error.response.status;
            errorMsg.value = error.response.data.detail;
        }
    }
};

const mostrarSolicitudes = async () => {
    try {
        // Verificar si el usuario es negociador (solo para LoginCompras)
        const es_negociador = localStorage.getItem("es_negociador") === "true";
        const negociador_filtro = es_negociador ? usuario_creador.value : filtro_negociador.value;
        
        const response = await axios.post(
            `${apiUrl}/mostrar_solicitudes`, 
            {
                solicitud_id: filtro_id_solicitud.value,
                estado_solicitud: filtro_estado_solicitud.value,
                solicitante: filtro_solicitante.value,
                negociador: negociador_filtro,
                fecha_desde: filtro_fecha_desde.value,
                fecha_hasta: filtro_fecha_hasta.value,
                fan: filtro_fan.value,
                limit: parseInt(limit.value),
                position: parseInt(position.value),
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
                }
            }
        );
        if (response.status === 200) {
            lista_solicitudes.value = response.data.data.registros;
            total_paginas.value = response.data.data.total_pag;
            total_registros.value = response.data.data.total_registros;
            indicadores.value = response.data.data.indicadores || [];
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
}

const mostrarEstadosSolicitud = async () => {
    try {
        const response = await axios.post(
            `${apiUrl}/get_estados_solicitud`, {},
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
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
        if (error.response.status === 401) {
          token_status.value = error.response.status;
          errorMsg.value = error.response.data.detail;
        } else if (error.response.status === 403) {
            token_status.value = error.response.status;
            errorMsg.value = error.response.data.detail;
        }
    }
};

const changePage = async (newPosition) => {
  position.value = newPosition;
  await mostrarSolicitudes(); // Vuelve a cargar los datos con el nuevo límite y posición
};

const limpiarCamposFiltro = async () => {
    const anio = new Date().getFullYear();
    filtro_id_solicitud.value = "";
    filtro_estado_solicitud.value = null;
    filtro_solicitante.value = null;
    filtro_negociador.value = [];
    filtro_fecha_desde.value = `${anio}-01-01`;
    filtro_fecha_hasta.value = `${anio}-12-31`;
    filtro_fan.value = null;
    await mostrarSolicitudes();
};

const toggleFiltroFan = (valor) => {
    if (filtro_fan.value === valor) {
        filtro_fan.value = null; // desactivar si se vuelve a presionar el mismo
    } else {
        filtro_fan.value = valor;
    }
    mostrarSolicitudes();
};

const toggleNegociadorFiltro = (negociador) => {
    const index = filtro_negociador.value.indexOf(negociador);
    if (index > -1) {
        filtro_negociador.value.splice(index, 1);
    } else {
        filtro_negociador.value.push(negociador);
    }
};

// ✅ Función para mostrar los detalles en el modal
function mostrarDetalles(detalles, cuerpo_texto, asunto, solicitud_id, estado, fecha_resuelto, mensaje_resuelto) {
    seleccionarTodoCotizado.value = null; // reset radio masivo al abrir
    solicitudId.value = solicitud_id;
    // Convertir cotizado a número y asegurar que negociador esté disponible
    detallesSolicitud.value = detalles.map(detalle => ({
        ...detalle,
        cotizado: Number(detalle.cotizado) || 0,
        negociador: detalle.negociador || null
    }));
    asuntoTexto.value = asunto;
    cuerpoTexto.value = cuerpo_texto;
    estadoSolicitud.value = estado;
    nuevoEstado.value = estado;
    fechaResuelto.value = fecha_resuelto || null; 
    mensajeResuelto.value = mensaje_resuelto || "";
    modalDetallesInstance.value.show();
};

// ✅ Función para mostrar el histórico en el modal
const mostrarHistorico = (historico) => {
    historicoSolicitud.value = historico.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)); // Ordenar por fecha
    if (!historicoModalInstance.value) {
        historicoModalInstance.value = new Modal(historicoModal);
    }
    historicoModalInstance.value.show();
};

function logout() {
    try {
        localStorage.clear();
        router.push('/login-compras'); // Redirigir al login
        
    } catch (error) {
        console.error(error)
    } finally {
        if (logoutModalInstance.value) {
            logoutModalInstance.value.hide();
        }
    }
};

const confirmLogout = () => {
    if (!logoutModalInstance.value) {
        logoutModalInstance.value = new Modal(logoutModal);
    }
    logoutModalInstance.value.show();
};

const actualizarNegociador = async () => {
    if (!nuevoNegociador.value) {
        alert("Por favor seleccione un negociador.");
        return;
    }

    try {
        const response = await axios.post(
            `${apiUrl}/actualizar_negociador`, 
            {
                solicitud_id: solicitudId.value,
                nuevo_negociador: nuevoNegociador.value,
                usuario_creador: usuario_creador.value
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`,
                },
            }
        );
        if (response.status === 200) {
            msg.value = response.data.message;
            // modalInstance.value.show();
            alert(msg.value);
            await mostrarSolicitudes();
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

const resetCamposModal = () => {
    nuevoNegociador.value = null;
    nuevoEstado.value = null;
    fechaResuelto.value = null;
    mensajeResuelto.value = "";
    seleccionarTodoCotizado.value = null;
};

// Función para obtener el nombre del negociador a partir del usuario
const obtenerNombreNegociador = (usuario) => {
    if (!usuario) return '-';
    const negociador = list_negociadores.value.find(neg => neg.usuario === usuario);
    return negociador ? negociador.nombre : usuario;
};

const handleEstadoChange = () => {
    if (nuevoEstado.value !== 4) {
        // Limpiar campos si no es "Resuelto"
        fechaResuelto.value = null;
        mensajeResuelto.value = "";
    }
};

const actualizarEstado = async () => {
    if (nuevoEstado.value === 4 && (!fechaResuelto.value || !mensajeResuelto.value)) {
        alert("Por favor complete todos los campos requeridos para el estado 'Resuelto'.");
        return;
    }

    if (!nuevoEstado.value) {
        alert("Por favor seleccione un estado.");
        return;
    }

    // Obtener el texto del estado seleccionado
    const estadoSeleccionado = lista_estados_solicitud.value.find(estado => estado.id === nuevoEstado.value);

    isLoadingEstado.value = true;
    try {
        const response = await axios.post(
            `${apiUrl}/actualizar_estado`, 
            {
                solicitud_id: solicitudId.value,
                nuevo_estado: nuevoEstado.value,
                texto_estado: estadoSeleccionado ? estadoSeleccionado.nombre : null, // Enviar el texto del estado
                fecha_resuelto: nuevoEstado.value === 4 ? fechaResuelto.value : null,
                comentario_resuelto: nuevoEstado.value === 4 ? mensajeResuelto.value : '',
                usuario_creador: usuario_creador.value
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`,
                },
            }
        );
        if (response.status === 200) {
            msg.value = response.data.message;
            alert(msg.value);
            await mostrarSolicitudes();
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
    } finally {
        isLoadingEstado.value = false;
    }
};

// Nueva función para refrescar los detalles de la solicitud actual
const refrescarDetallesSolicitud = async () => {
    if (!solicitudId.value) return;
    try {
        const response = await axios.post(
            `${apiUrl}/get_detalles_solicitud`,
            { 
                solicitud_id: solicitudId.value 
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
                }
            }
        );
        if (response.status === 200 && response.data.data) {
            // Actualiza los detalles en el modal y convierte cotizado a número
            detallesSolicitud.value = response.data.data.map(detalle => ({
                ...detalle,
                cotizado: Number(detalle.cotizado) || 0
            }));
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

// Nueva función para actualizar la cantidad de un detalle
const actualizarCantidadDetalle = async (detalle) => {
    // Validar cantidad_nueva
    if (
        detalle.cantidad_nueva === undefined ||
        detalle.cantidad_nueva === null ||
        detalle.cantidad_nueva === "" ||
        isNaN(detalle.cantidad_nueva)
    ) {
        alert("Por favor ingrese una cantidad válida.");
        return;
    }
    if (detalle.cantidad_nueva < 0) {
        alert("La cantidad no puede ser negativa.");
        return;
    }
    if (detalle.producto_faltante !== undefined && detalle.cantidad_nueva > detalle.producto_faltante) {
        alert("La cantidad nueva no puede ser mayor al faltante.");
        return;
    }

    try {
        const response = await axios.post(
            `${apiUrl}/actualizar_cantidad_detalle`,
            {
                detalle_id: detalle.id,
                cantidad_nueva: detalle.cantidad_nueva,
                solicitud_id: solicitudId.value,
                usuario_creador: usuario_creador.value,
                producto_despachado: detalle.producto_despachado,
                producto_faltante: detalle.producto_faltante,
                producto: detalle.producto,
                referencia: detalle.referencia
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
                }
            }
        );
        if (response.status === 200) {
            await mostrarSolicitudes();
            await refrescarDetallesSolicitud();
            alert(response.data.message || "Cantidad actualizada correctamente.");
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

// Guardado masivo: actualiza todos los detalles de una sola vez
const guardarMasivoDetalles = async () => {
    isLoading.value = true;
    let errores = 0;
    try {
        for (const detalle of detallesSolicitud.value) {
            try {
                console.log(detalle);
                await axios.post(
                    `${apiUrl}/actualizar_cotizado`,
                    {
                        detalle_id: detalle.id,
                        solicitud_id: solicitudId.value,
                        cotizado: detalle.cotizado,
                        negociador: detalle.negociador,
                        referencia: detalle.referencia,
                        estado_solicitud: estadoSolicitud.value
                    },
                    {
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token.value}`
                        }
                    }
                );
            } catch {
                errores++;
            }
        }
        await mostrarSolicitudes();
        if (errores === 0) {
            alert("Todos los detalles fueron actualizados correctamente.");
        } else {
            alert(`Actualización completada con ${errores} error(es). Revisa los detalles.`);
        }
    } finally {
        isLoading.value = false;
    }
};

// Nueva función para actualizar cotizado y negociador del detalle
const actualizarDetalleCompleto = async (detalle) => {
    try {
        console.log(detalle);
        const response = await axios.post(
            `${apiUrl}/actualizar_cotizado`,
            {
                detalle_id: detalle.id,
                solicitud_id: solicitudId.value,
                cotizado: detalle.cotizado,
                negociador: detalle.negociador,
                referencia: detalle.referencia,
                estado_solicitud: estadoSolicitud.value
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
                }
            }
        );
        if (response.status === 200) {
            // Refrescar la lista de solicitudes para mostrar el porcentaje actualizado
            await mostrarSolicitudes();
            console.log(response.data.message || "Detalle actualizado correctamente.");
            alert("Detalle actualizado correctamente.");
        }
    } catch (error) {
        console.error('Error al actualizar detalle:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response?.data?.message || "Error al actualizar detalle";
        if (error.response?.status === 401) {
          token_status.value = error.response.status;
          errorMsg.value = error.response.data.detail;
        } else if (error.response?.status === 403) {
            token_status.value = error.response.status;
            errorMsg.value = error.response.data.detail;
        }
    }
};

// Función anterior para actualizar el campo cotizado de un detalle (ya no se usa con @change)
const actualizarCotizado = async (detalle) => {
    try {
        console.log(detalle);
        const response = await axios.post(
            `${apiUrl}/actualizar_cotizado`,
            {
                detalle_id: detalle.id,
                solicitud_id: solicitudId.value,
                cotizado: detalle.cotizado,
                referencia: detalle.referencia,
                estado_solicitud: estadoSolicitud.value
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
                }
            }
        );
        if (response.status === 200) {
            // Refrescar la lista de solicitudes para mostrar el porcentaje actualizado
            await mostrarSolicitudes();
            console.log(response.data.message || "Cotizado actualizado correctamente.");
        }
    } catch (error) {
        console.error('Error al actualizar cotizado:', error);
        modalErrorInstance.value.show();
        errorMsg.value = error.response?.data?.message || "Error al actualizar cotizado";
        if (error.response?.status === 401) {
          token_status.value = error.response.status;
          errorMsg.value = error.response.data.detail;
        } else if (error.response?.status === 403) {
            token_status.value = error.response.status;
            errorMsg.value = error.response.data.detail;
        }
    }
};

// ✅ Función mounted que carga información ANTES de que la página renderice
onMounted(() => {

  token.value = localStorage.getItem("token");
  usuario_creador.value = localStorage.getItem("usuario_creador");
  es_negociador_usuario.value = localStorage.getItem("es_negociador") === "true";

  modalInstance.value = new Modal(exitoModal);
  modalErrorInstance.value = new Modal(errorModal);
  modalDetallesInstance.value = new Modal(detallesModal);

  if (!token.value) {
      router.push('/login-compras'); // Redirigir al login si no hay token
  }

  cargarDatos();
  cargarSolicitantes();
  mostrarEstadosSolicitud();
  mostrarSolicitudes();

  // Listener para cerrar dropdown de negociadores al hacer click fuera
  document.addEventListener('click', cerrarDropdownNegociadores);
});

// Limpiar listener al desmontar componente
onUnmounted(() => {
  document.removeEventListener('click', cerrarDropdownNegociadores);
});

// Función para cerrar dropdown cuando se hace click fuera
const cerrarDropdownNegociadores = (event) => {
  const formGroup = event.target.closest('.form-group');
  if (!formGroup || !formGroup.querySelector('.negociadores-dropdown')) {
    const clickedMultiselect = event.target.closest('.custom-multiselect');
    if (!clickedMultiselect) {
      mostrar_dropdown_negociadores_filtro.value = false;
    }
  }
};

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
  justify-content: space-between; /* Separa los elementos a los extremos */
}
.header-left {
  display: flex;
  align-items: center; /* Alinea verticalmente la imagen y el título */
  gap: 10px; /* Espaciado entre la imagen y el título */
}
.header-container h2{
  font-size: 1.3rem;
}

.logout-button {
    background-color: #ffd95e; /* Azul similar a otros elementos */
    color: black;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background 0.3s;
}

.logout-button:hover {
    background-color: #ffd858; /* Azul más claro al pasar el cursor */
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

.submit-button,
.actualizar-negociador-button {
    width: auto; /* Ajusta el ancho al contenido */
    padding: 8px 16px; /* Tamaño similar al botón de limpiar */
    background: #ffd95e;
    color: black;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 0.9em;
}

.submit-button:hover,
.actualizar-negociador-button:hover {
  background: #ffd858;
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
    width: 80%;
    margin: 0 auto;
    height: calc(100vh - 120px);
    padding: 20px;
    background: linear-gradient(135deg, #fffef8 0%, #ffffff 100%);
    display: flex;
    flex-direction: column;
    align-self: center;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.h3-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #ffb300;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 3px solid transparent;
    border-image: linear-gradient(90deg, #ffb300, #ffd95e, transparent) 1;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
}

.h3-title::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -3px;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #ffb300, #ffd95e);
    border-radius: 2px;
}

.table-container {
    flex-grow: 1;
    overflow-y: auto;
    max-height: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 10px;
}

table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    position: relative;
    background: white;
    border-radius: 8px;
    overflow: hidden;
}

/* Dejar fija la cabecera */
thead {
    position: sticky;
    top: 0;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

th {
    background: linear-gradient(135deg, #ffd95e 0%, #ffb300 100%);
    color: #1a1a1a;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.75rem;
    padding: 14px 12px;
    border: none;
    position: relative;
}

th::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255,179,0,0.5), transparent);
}

.modal-body table th {
    background: linear-gradient(135deg, #ffd95e 0%, #ffb300 100%);
    color: #1a1a1a;
}

td {
    padding: 12px 8px;
    text-align: center;
    font-size: 0.8rem;
    border-bottom: 1px solid #f0f0f0;
    border-right: 1px solid #f8f8f8;
    transition: all 0.3s ease;
}

td:last-child {
    border-right: none;
}

tbody tr {
    transition: all 0.3s ease;
    background: white;
}

tbody tr:nth-child(even) {
    background: #fffef8;
}

tbody tr:hover {
    background: linear-gradient(135deg, #fff9e6 0%, #fffef8 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(255, 217, 94, 0.25);
    cursor: pointer;
}

tbody tr:hover td {
    color: #b38600;
    font-weight: 500;
}

tbody tr td:first-child {
    font-weight: 600;
    color: #ffb300;
}

tbody tr td i {
    transition: all 0.3s ease;
    font-size: 1.1rem;
}

/* Asegurar que la celda de acciones muestre los iconos en línea */
tbody tr td:last-child {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
}

.action-icon {
    cursor: pointer;
    padding: 6px;
    border-radius: 50%;
    background: rgba(255, 195, 0, 0.1);
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.action-icon:hover {
    transform: scale(1.3) rotate(10deg);
    background: rgba(255, 195, 0, 0.2);
    filter: drop-shadow(0 2px 6px rgba(255, 195, 0, 0.5));
}

.action-icon:active {
    transform: scale(1.1);
}

tbody tr td i:hover {
    transform: scale(1.3);
    filter: drop-shadow(0 2px 4px rgba(255, 195, 0, 0.5));
}

/* =============================================
   Filas de cliente fan en la tabla de solicitudes
   ============================================= */
@keyframes fan-pulse {
  0%, 100% {
    background: linear-gradient(135deg, #fffde7 0%, #fff9c4 50%, #fffde7 100%);
    box-shadow: inset 3px 0 0 #FFD700, 0 0 6px rgba(255, 215, 0, 0.2);
  }
  50% {
    background: linear-gradient(135deg, #fff3b0 0%, #ffe869 50%, #fff3b0 100%);
    box-shadow: inset 3px 0 0 #FFA500, 0 0 14px rgba(255, 195, 0, 0.45);
  }
}

.solicitud-fan {
  animation: fan-pulse 4.5s ease-in-out infinite;
  border-left: 3px solid #FFD700;
  position: relative;
}

.solicitud-fan td {
  color: #7a5800 !important;
  font-weight: 500;
}

.solicitud-fan td:first-child {
  color: #b8860b !important;
  font-weight: 700;
}

.solicitud-fan:hover {
  animation: none;
  background: linear-gradient(135deg, #ffe066 0%, #fffde7 100%) !important;
  box-shadow: 0 4px 18px rgba(255, 200, 0, 0.5) !important;
  transform: scale(1.012);
}

.solicitud-fan:hover td {
  color: #7a5800 !important;
  font-weight: 600;
}

.no-registros {
    text-align: center;
    font-weight: 600;
    color: #999;
    padding: 32px;
    font-size: 1rem;
    background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
    border-radius: 8px;
    margin: 20px;
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

.actualizar-negociador-button {
  width: auto; /* Ajusta el ancho del botón al contenido */
  align-self: flex-end; /* Alinea el botón al inicio */
}

.actualizar-estado-button {
    width: auto; /* Ajusta el ancho al contenido */
    padding: 8px 16px; /* Tamaño similar al botón de limpiar */
    background: #ffd95e;
    color: black;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.3s;
    font-size: 0.9em;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.actualizar-estado-button:hover {
    background: #ffd858;
}

.actualizar-estado-button:disabled {
    background: #ccc;
    cursor: not-allowed;
    color: #666;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

/* ── Botones toggle Fan / No Fan ── */
.fan-toggle-button {
    width: auto;
    padding: 8px 14px;
    background: #f5f5f5;
    color: #555;
    border: 1.5px solid #d1d5db;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85em;
    font-weight: 500;
    transition: all 0.25s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    align-self: flex-end;
}

.fan-toggle-button:hover {
    border-color: #ffb300;
    color: #7a5800;
    background: #fffde7;
}

.fan-toggle-button.fan-toggle-active {
    background: linear-gradient(135deg, #ffb300 0%, #ffd95e 100%);
    color: #1a1a1a;
    border-color: #ffb300;
    box-shadow: 0 2px 8px rgba(255, 179, 0, 0.4);
    font-weight: 700;
}

.fan-toggle-button.fan-toggle-active i {
    color: #7a5800;
}

.fan-toggle-button.fan-toggle-nofan:hover {
    border-color: #6c757d;
    color: #333;
    background: #f0f0f0;
}

.fan-toggle-button.fan-toggle-active-nofan {
    background: #6c757d;
    color: #fff;
    border-color: #6c757d;
    box-shadow: 0 2px 8px rgba(108, 117, 125, 0.35);
    font-weight: 700;
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
  background-color: #ffd95e;
  color: black;
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
  background-color: #ffd858;
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

.disabled-icon {
    pointer-events: none;
    opacity: 0.5;
}

/* ── Controles masivos en la modal ── */
.bulk-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fffde7 0%, #fff9c4 100%);
  border: 1px solid #ffe082;
  border-radius: 6px;
  padding: 8px 14px;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;
}

.bulk-radio-group {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.bulk-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7a5800;
  white-space: nowrap;
}

.radio-label-inline {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  cursor: pointer;
  margin: 0;
  color: #5a4000;
}

.radio-label-inline input[type="radio"] {
  accent-color: #ffb300;
  cursor: pointer;
  width: 15px;
  height: 15px;
}

.actualizar-masivo-button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  background: linear-gradient(135deg, #ffb300 0%, #ffd95e 100%);
  color: #1a1a1a;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(255, 179, 0, 0.3);
  white-space: nowrap;
}

.actualizar-masivo-button:hover {
  background: linear-gradient(135deg, #ffa000 0%, #ffca28 100%);
  box-shadow: 0 4px 10px rgba(255, 179, 0, 0.45);
  transform: translateY(-1px);
}

.actualizar-masivo-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.spinner-sm {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #7a5800;
  border-radius: 50%;
  width: 13px;
  height: 13px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Radio buttons de cotizado */
.radio-cotizado {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.82rem;
  cursor: pointer;
  margin: 0;
  white-space: nowrap;
}

.radio-label input[type="radio"] {
  accent-color: #ffb300;
  cursor: pointer;
  width: 14px;
  height: 14px;
}

/* Estilos para el custom multiselect de negociadores */
.custom-multiselect {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 38px;
  transition: border-color 0.2s;
}

.custom-multiselect:hover {
  border-color: #2778bf;
}

.custom-multiselect .selected-items {
  flex: 1;
}

.custom-multiselect .placeholder {
  color: #9ca3af;
  font-size: 0.9em;
}

.custom-multiselect .selected-count {
  color: #2778bf;
  font-weight: 500;
  font-size: 0.9em;
}

.custom-multiselect i {
  color: #6b7280;
  font-size: 0.8em;
  transition: transform 0.2s;
}

.custom-multiselect i.rotated {
  transform: rotate(180deg);
}

/* Dropdown de negociadores */
.negociadores-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
}

.negociador-item {
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.negociador-item:last-child {
  border-bottom: none;
}

.negociador-item:hover {
  background-color: #f3f4f6;
}

.negociador-item input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #2778bf;
}

.negociador-item label {
  cursor: pointer;
  flex: 1;
  margin: 0;
  font-size: 0.9em;
  user-select: none;
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

/* =============================================
   Dashboard de KPIs
   ============================================= */
.dashboard-kpis {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 80%;
    margin: 16px auto;
    padding: 0 4px;
}

.kpi-card {
    flex: 1 1 160px;
    min-width: 140px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-left: 5px solid #e9ecef;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
}

.kpi-card::after {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    opacity: 0.06;
    background: currentColor;
}

.kpi-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
}

.kpi-total  { border-left-color: #2778bf; }
.kpi-nuevas { border-left-color: #17a2b8; }
.kpi-proceso { border-left-color: #ffb300; }
.kpi-resueltas { border-left-color: #28a745; }
.kpi-porcentaje { border-left-color: #6f42c1; flex-direction: column; align-items: center; gap: 0; }

.kpi-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    flex-shrink: 0;
}

.kpi-total  .kpi-icon { background: #e8f0fb; color: #2778bf; }
.kpi-nuevas .kpi-icon { background: #e0f7fa; color: #17a2b8; }
.kpi-proceso .kpi-icon { background: #fff8e1; color: #ffb300; }
.kpi-resueltas .kpi-icon { background: #e8f5e9; color: #28a745; }

.kpi-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.kpi-valor {
    font-size: 1.8rem;
    font-weight: 800;
    line-height: 1;
    color: #1a1a1a;
}

.kpi-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #6c757d;
    margin-top: 2px;
}

/* T\00e1cometro / gauge */
.kpi-gauge {
    position: relative;
    width: 100px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
}

.gauge-svg {
    width: 100px;
    height: 60px;
    overflow: visible;
}

.gauge-value {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.2rem;
    font-weight: 800;
    color: #6f42c1;
    line-height: 1;
}

.kpi-porcentaje .kpi-label {
    margin-top: 4px;
}

@media (max-width: 900px) {
    .dashboard-kpis {
        width: 95%;
    }
    .kpi-card {
        flex: 1 1 130px;
    }
}

</style>
