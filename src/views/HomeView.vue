<template>
    <div class="container">
      <div class="header-container">
        <div class="header-left">
          <img class="img-title" :src="logo" :alt="logo">
          <h2>SOLICITUDES - MACROPROCESO DE COTIZACIONES</h2>
        </div>
        <!-- Solo el botón de cerrar sesión queda aquí -->
        <div class="header-buttons">
          <button class="logout-button" @click="confirmLogout">Cerrar sesión</button>
        </div>
      </div>

      <!-- NUEVO: Campos de negociador, asunto y cuerpo del mensaje arriba del input file -->
      <div class="form-flex" style="margin: 20px 20px 0 20px;">
        <div class="row-group">
          <div class="form-group small-width" style="position: relative;" :class="{ 'error': (!tercero_seleccionado && mostrarErrores) }">
            <label>Tercero *:</label>
            <input 
              type="text" 
              class="input-field" 
              v-model="tercero_busqueda"
              @input="buscarTerceros"
              @focus="mostrar_dropdown_terceros = tercero_busqueda.length >= 3 && list_terceros.length > 0"
              placeholder="Escribe para buscar..."
            >
            <!-- Dropdown de resultados -->
            <div 
              v-if="mostrar_dropdown_terceros" 
              class="terceros-dropdown"
            >
              <div 
                v-for="tercero in list_terceros" 
                :key="tercero.nit"
                class="tercero-item"
                :class="{ 'tercero-fan': tercero.fan }"
                @click="seleccionarTercero(tercero)"
              >
                <i v-if="tercero.fan" class="fa-solid fa-star" style="color: #FFD700; margin-right: 6px;"></i>
                {{ tercero.nombres }} ({{ tercero.nit }})
              </div>
            </div>
            <small v-if="tercero_busqueda.length > 0 && tercero_busqueda.length < 3" style="color: #888; font-size: 0.8em;">
              Ingresa al menos 3 caracteres para buscar
            </small>
            <p v-if="!tercero_seleccionado && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
          </div>
          <div class="form-group small-width" :class="{ 'error': (negociador.length === 0 && mostrarErrores)}" style="position: relative;">
            <label>Negociador(es) *:</label>
            <div class="negociadores-readonly" :class="{ 'negociadores-readonly--error': negociador.length === 0 && mostrarErrores }">
              <span v-if="negociador.length === 0" class="negociadores-readonly__placeholder">
                <i class="fa-solid fa-circle-info" style="margin-right:5px; color:#aaa;"></i>
                Se detectará automáticamente de los productos...
              </span>
              <template v-else>
                <span 
                  v-for="id in negociador" 
                  :key="id" 
                  class="negociador-chip"
                >
                  <i class="fa-solid fa-user" style="margin-right:4px; font-size:0.75em;"></i>
                  {{ list_negociadores.find(n => n.usuario === id)?.nombre || id }}
                </span>
              </template>
            </div>
            <p v-if="negociador.length === 0 && mostrarErrores" class="error-text">Debe agregar al menos un producto con negociador asignado.</p>
          </div>
          <div class="form-group" :class="{ 'error': (!asunto && mostrarErrores)}" >
            <label>Asunto *:</label>
            <input type="text" class="input-field" v-model="asunto">
            <p v-if="!asunto && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
          </div>
        </div>
        <div class="column-group">
          <div class="form-group" :class="{ 'error': (!cuerpo_texto && mostrarErrores)}">
            <label>Cuerpo del mensaje *:</label>
            <textarea 
              class="input-field" 
              v-model="cuerpo_texto" 
              @input="autoExpand($event)"
              ref="textarea"
            ></textarea>
            <p v-if="!cuerpo_texto && mostrarErrores" class="error-text">Este campo es obligatorio.</p>
          </div>
        </div>
      </div>

      <!-- Inputs de archivo y botón cargar, ocultar si el checkbox está activo -->
      <div 
        v-if="!mostrarAcordeonProductos"
        style="display: flex; align-items: center; margin: 20px 20px;"
      >
        <input 
          type="file" 
          class="form-control"
          ref="fileInput"
          @change="onFileChange"
          style="margin-right: 10px;"
        >
        <!-- Botón de descargar template a la derecha del input file -->
        <button 
          class="logout-button template-button" 
          style="height: 38px; margin-right: 10px;" 
          @click="descargarArchivo"
        >
          Descargar Template
        </button>
        <button 
          class="logout-button" 
          style="height: 38px; margin-right: 10px;" 
          @click="procesarArchivo"
          :disabled="!archivoSeleccionado"
        >
          Cargar
        </button>
        <!-- Icono de ojo solo si productos tiene datos -->
        <i 
          v-if="productos && productos.length > 0 && productos.some(p => p.referencia || p.producto || p.cantidad || p.proveedor || p.marca)" 
          class="fa-solid fa-eye" 
          style="color: #2778bf; font-size: 20px; margin-left: 12px; cursor: pointer;"
          title="Productos cargados"
          @click="abrirModalProductos"
        ></i>
      </div>

      <!-- Checkbox para habilitar el acordeón de productos -->
      <div style="margin: 20px 20px 0 20px; display: flex; align-items: center;">
        <input type="checkbox" id="habilitarProductos" v-model="mostrarAcordeonProductos" style="margin-right: 8px;">
        <label for="habilitarProductos" style="margin: 0;">Habilitar productos manualmente</label>
      </div>

      <!-- Acordeón de productos solo si el checkbox está activo -->
      <div v-if="mostrarAcordeonProductos" class="accordion" id="productosAccordion">
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
                          <form @submit.prevent="validarFormulario" class="form-flex">
                              <p class="required-fields-note">Los campos señalados con <strong>*</strong> son obligatorios.</p>
                              <table class="table table-bordered">
                                <thead>
                                  <tr>
                                    <th>Referencia</th>
                                    <th>Descripción *</th>
                                    <th>Cantidad *</th>
                                    <th>Proveedor</th>
                                    <th>Marca *</th>
                                    <th>Negociador *</th>
                                    <th>Eliminar</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr v-for="(row, index) in productos" :key="index">
                                    <td>
                                      <input type="text" class="input-field" v-model="row.referencia" />
                                    </td>
                                    <td>
                                      <input type="text" class="input-field" :class="{ 'input-field--error': mostrarErrores && !row.producto }" v-model="row.producto" />
                                    </td>
                                    <td>
                                      <input type="number" class="input-field" :class="{ 'input-field--error': mostrarErrores && (row.cantidad === '' || row.cantidad === null || row.cantidad === undefined) }" v-model="row.cantidad" />
                                    </td>
                                    <td>
                                      <input type="text" class="input-field" v-model="row.proveedor" />
                                    </td>
                                    <td>
                                      <input type="text" class="input-field" :class="{ 'input-field--error': mostrarErrores && !row.marca }" v-model="row.marca" />
                                    </td>
                                    <td>
                                      <select class="input-field" :class="{ 'input-field--error': mostrarErrores && !row.negociador }" v-model="row.negociador">
                                        <option :value="null">Seleccione...</option>
                                        <option v-for="neg in list_negociadores" :key="neg.usuario" :value="neg.usuario">{{ neg.nombre }}</option>
                                      </select>
                                    </td>
                                    <td>
                                      <button type="button" class="delete-button" @click="eliminarRow(index)">❌</button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <hr>
                              <div style="margin-top: 16px;">
                                <button type="button" class="round-button" style="position:static; width:40px; height:40px; font-size:18px;" @click="agregarRow">
                                  <i class="fa-solid fa-plus"></i>
                                </button>
                              </div>
                              <div class="column-group">
                                  <button 
                                    type="submit" 
                                    class="submit-button align-start" 
                                    :disabled="isLoading"
                                  >
                                    <span v-if="isLoading" class="spinner"></span>
                                    <span v-else>Registrar Solicitud</span>
                                  </button>
                              </div>
                          </form>
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
                  <span class="kpi-label">Total Enviadas</span>
                  <span class="kpi-items"><i class="fa-solid fa-list" style="margin-right:4px;"></i>{{ kpi_total_items }} ítems</span>
              </div>
          </div>
          <div class="kpi-card kpi-nuevas">
              <div class="kpi-icon"><i class="fa-solid fa-bell"></i></div>
              <div class="kpi-info">
                  <span class="kpi-valor">{{ kpi_nuevas }}</span>
                  <span class="kpi-label">Nuevas</span>
                  <span class="kpi-items"><i class="fa-solid fa-list" style="margin-right:4px;"></i>{{ kpi_nuevas_items }} ítems</span>
              </div>
          </div>
          <div class="kpi-card kpi-proceso">
              <div class="kpi-icon"><i class="fa-solid fa-spinner"></i></div>
              <div class="kpi-info">
                  <span class="kpi-valor">{{ kpi_en_proceso }}</span>
                  <span class="kpi-label">En Proceso</span>
                  <span class="kpi-items"><i class="fa-solid fa-list" style="margin-right:4px;"></i>{{ kpi_proceso_items }} ítems</span>
              </div>
          </div>
          <div class="kpi-card kpi-resueltas">
              <div class="kpi-icon"><i class="fa-solid fa-circle-check"></i></div>
              <div class="kpi-info">
                  <span class="kpi-valor">{{ kpi_resueltas }}</span>
                  <span class="kpi-label">Resueltas</span>
                  <span class="kpi-items"><i class="fa-solid fa-list" style="margin-right:4px;"></i>{{ kpi_resueltas_items }} ítems</span>
              </div>
          </div>
          <div class="kpi-card kpi-porcentaje">
              <div class="kpi-gauge">
                  <svg viewBox="0 0 120 70" class="gauge-svg">
                      <defs>
                          <linearGradient id="gaugeGradHome" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" style="stop-color:#ffb300"/>
                              <stop offset="100%" style="stop-color:#28a745"/>
                          </linearGradient>
                      </defs>
                      <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#e9ecef" stroke-width="12" stroke-linecap="round"/>
                      <path
                          d="M10 60 A50 50 0 0 1 110 60"
                          fill="none"
                          stroke="url(#gaugeGradHome)"
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
                                  <div v-if="!es_solicitante_normal" class="form-group">
                                      <label>Solicitante:</label>
                                      <select class="input-field" v-model="filtro_solicitante">
                                          <option :value="null">Seleccione...</option>
                                          <option v-for="soli in list_solicitantes" :value="soli.usuario">{{ soli.nombre }}</option>
                                      </select>
                                  </div>
                                  <div class="form-group" style="position: relative;">
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
                                  <div class="form-group">
                                    <label>Cotizado:</label>
                                    <select class="input-field" v-model="filtro_cotizado">
                                      <option :value="null">Todos</option>
                                      <option :value="1">Sí</option>
                                      <option :value="0">No</option>
                                    </select>
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
                        <td colspan="6" class="no-registros">No hay registros disponibles</td>
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
                                style="color: #2778bf;" 
                                @click="mostrarDetalles(sol.detalles, sol.cuerpo_texto, sol.asunto, sol.estado_solicitud, sol.fecha_resuelto, sol.comentario_resuelto)"
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
                    <h5 class="modal-title" id="exitoModalLabel">Modal Registro</h5>
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
                    <h5 class="modal-title" id="detallesModalLabel">{{asuntoTexto}}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" v-if="!detallesSolicitud || detallesSolicitud.length === 0">
                    <p>No hay detalles.</p>
                </div>
                <div class="modal-body" v-else>
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Referencia</th>
                                <th>Descripción *</th>
                                <th>Cantidad *</th>
                                <th>Proveedor</th>
                                <th>Marca *</th>
                                <th>Cotizado</th>
                                <th>Negociador *</th>
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
                                <td>{{ detalle.cotizado === 1 ? 'Sí' : 'No' }}</td>
                                <td>{{ detalle.negociador }}</td>
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
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
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

    <!-- Modal para ver y editar productos cargados -->
    <div class="modal fade" id="productosModal" tabindex="-1" aria-labelledby="productosModalLabel" aria-hidden="true" ref="productosModal">
        <div class="modal-dialog modal-dialog-centered modal-xl">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="productosModalLabel">Productos cargados</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="productos-table-scroll">
                <p class="required-fields-note">Los campos señalados con <strong>*</strong> son obligatorios.</p>
                <table class="table table-bordered">
                  <thead>
                    <tr>
                      <th>Referencia</th>
                      <th>Descripción *</th>
                      <th>Cantidad *</th>
                      <th>Proveedor</th>
                      <th>Marca *</th>
                      <!-- <th>Cotizado</th> -->
                      <th>Negociador *</th>
                      <th>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in productos" :key="idx">
                      <td>
                        <input type="text" class="input-field" v-model="row.referencia" />
                      </td>
                      <td>
                        <input type="text" class="input-field" :class="{ 'input-field--error': mostrarErrores && !row.producto }" v-model="row.producto" />
                      </td>
                      <td>
                        <input type="number" class="input-field" :class="{ 'input-field--error': mostrarErrores && (row.cantidad === '' || row.cantidad === null || row.cantidad === undefined) }" v-model="row.cantidad" />
                      </td>
                      <td>
                        <input type="text" class="input-field" v-model="row.proveedor" />
                      </td>
                      <td>
                        <input type="text" class="input-field" :class="{ 'input-field--error': mostrarErrores && !row.marca }" v-model="row.marca" />
                      </td>
                      <td>
                        <select class="input-field" :class="{ 'input-field--error': mostrarErrores && !row.negociador }" v-model="row.negociador">
                          <option :value="null">Seleccione...</option>
                          <option v-for="neg in list_negociadores" :key="neg.usuario" :value="neg.usuario">{{ neg.nombre }}</option>
                        </select>
                      </td>
                      <!-- <td>
                        <select 
                          class="form-select form-select-sm"
                          style="width: 80px;"
                          v-model.number="row.cotizado"
                        >
                          <option :value="0">No</option>
                          <option :value="1">Sí</option>
                        </select>
                      </td> -->
                      <td>
                        <button type="button" class="delete-button" @click="eliminarRow(idx)">❌</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style="margin-top: 16px;">
                <button type="button" class="round-button" style="position:static; width:40px; height:40px; font-size:18px;" @click="agregarRow">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <div class="modal-footer">
              <button 
                type="submit" 
                class="submit-button align-start" 
                :disabled="isLoading"
                style="height: 38px; margin-bottom: 10px;"
                @click="validarFormulario"
              >
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>Registrar Solicitud</span>
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
    </div>

</template>

<script setup>
import apiUrl from "../../config.js";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { Modal } from 'bootstrap';
import logo from "@/assets/logo.png";

const token = ref("");
const usuario_creador = ref("");

const productos = ref([{ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "", cotizado: 0, negociador: null }]);
const negociador = ref([]);
const asunto = ref("");
const asuntoTexto = ref("");
const cuerpo_texto = ref("");
const tercero_seleccionado = ref(null);
const tercero_busqueda = ref("");
const mostrar_dropdown_terceros = ref(false);
const mostrar_dropdown_negociadores = ref(false);
const list_negociadores = ref([]);
const list_terceros = ref([]);
const list_solicitantes = ref([]);
const lista_solicitudes = ref([]);
const lista_estados_solicitud = ref([]);
const fechaResuelto = ref(null);
const mensajeResuelto = ref("");
const estadoSolicitud = ref(null);
const mostrarAcordeonProductos = ref(false);

const modalInstance = ref(null);
const modalErrorInstance = ref(null);
const modalDetallesInstance = ref(null);
const logoutModalInstance = ref(null);
const historicoModalInstance = ref(null);
const productosModalInstance = ref(null);

const msg = ref("");
const errorMsg = ref("");
const detallesSolicitud = ref("");
const cuerpoTexto = ref("");
const textarea = ref(null);
const historicoSolicitud = ref([]);

const filtro_id_solicitud = ref("");
const filtro_estado_solicitud = ref(null);
const filtro_solicitante = ref(null);
const filtro_negociador = ref([]);
const filtro_cotizado = ref(null);
const anioActual = new Date().getFullYear();
const filtro_fecha_desde = ref(`${anioActual}-01-01`);
const filtro_fecha_hasta = ref(`${anioActual}-12-31`);
const filtro_fan = ref(null);
const es_solicitante_normal = ref(false);
const mostrar_dropdown_negociadores_filtro = ref(false);

const total_paginas = ref(0);
const total_registros = ref(0);
const limit = ref(15);
const position = ref(1);

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
const kpi_total_items = computed(() =>
    indicadores.value.reduce((acc, i) => acc + (i.total_items || 0), 0)
);
const kpi_nuevas_items = computed(() =>
    indicadores.value
        .filter(i => i.estado_nombre.toLowerCase().includes('nueva') || i.estado_nombre.toLowerCase().includes('nuevo'))
        .reduce((acc, i) => acc + (i.total_items || 0), 0)
);
const kpi_resueltas_items = computed(() =>
    indicadores.value
        .filter(i => i.estado_id === 4)
        .reduce((acc, i) => acc + (i.total_items || 0), 0)
);
const kpi_proceso_items = computed(() => kpi_total_items.value - kpi_nuevas_items.value - kpi_resueltas_items.value);

const mostrarErrores = ref(false);

const negociadorError = ref(false);
const asuntoError = ref(false);
const cuerpo_textoError = ref(false);

const token_status = ref(0);

const isLoading = ref(false);

const fileInput = ref(null);
const archivoSeleccionado = ref(null);

// Maneja el cambio de archivo
function onFileChange(event) {
  archivoSeleccionado.value = event.target.files[0] || null;
}

// Procesa el archivo seleccionado
function procesarArchivo() {
  if (archivoSeleccionado.value) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      const base64 = e.target.result.split(',')[1]; // Quita el prefijo data:...
      try {
        const response = await axios.post(
          `${apiUrl}/cargar_archivo`, // Cambia el endpoint si es necesario
          {
            archivo: base64,
            nombre: archivoSeleccionado.value.name
          },
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token.value}`
            }
          }
        );
        if (response.status === 200) {
          console.log("Archivo enviado correctamente al backend:", response.data);
          productos.value = response.data.data;
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
    reader.readAsDataURL(archivoSeleccionado.value);
  } else {
    console.log("No se ha seleccionado ningún archivo.");
  }
}

const router = useRouter();

const validarFormulario = () => {
    mostrarErrores.value = true;

    // Validar campos superiores
    if (!tercero_seleccionado.value || negociador.value.length === 0 || !asunto.value || !cuerpo_texto.value) {
        return;
    }

    // Validar campos obligatorios de cada producto
    const productosInvalidos = productos.value.some(
        row => !row.producto || row.cantidad === '' || row.cantidad === null || row.cantidad === undefined || !row.marca || !row.negociador
    );
    if (productosInvalidos) {
        return;
    }

    guardar_solicitud();
};

const guardar_solicitud = async () => {
    isLoading.value = true; // Activa el spinner y desactiva el botón
    try {
        const response = await axios.post(
            `${apiUrl}/guardar_solicitud`, 
            {
                lista_productos: productos.value,
                solicitante: usuario_creador.value,
                negociador: negociador.value,
                asunto: asunto.value,
                cuerpo_texto: cuerpo_texto.value,
                nit_tercero: tercero_seleccionado.value,
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
                }
            }
        );
        if (response.status === 200) {
            // Cerrar la modal de productos si está activa antes de mostrar la de éxito
            if (productosModalInstance.value && productosModalInstance.value._isShown) {
                productosModalInstance.value.hide();
            }
            msg.value = response.data.message;
            modalInstance.value.show();
            limpiarCampos();
            mostrarSolicitudes();
        }
    } catch (error) {
        // Cerrar la modal de productos si está activa antes de mostrar la de error
        if (productosModalInstance.value && productosModalInstance.value._isShown) {
            productosModalInstance.value.hide();
        }
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
        isLoading.value = false; // Desactiva el spinner y habilita el botón
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

const cargarTerceros = async () => {
    if (tercero_busqueda.value.length < 2) {
        list_terceros.value = [];
        mostrar_dropdown_terceros.value = false;
        return;
    }

    try {
        const response = await axios.post(
            `${apiUrl}/get_terceros`, 
            { busqueda: tercero_busqueda.value },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token.value}`
                }
            }
        );
        if (response.status === 200) {
            list_terceros.value = response.data.data;
            mostrar_dropdown_terceros.value = list_terceros.value.length > 0;
        }

    } catch (error) {
        console.error('Error al cargar los terceros:', error);
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

// Debounce para la búsqueda de terceros
let timeoutTerceros = null;
const buscarTerceros = () => {
    clearTimeout(timeoutTerceros);
    timeoutTerceros = setTimeout(() => {
        cargarTerceros();
    }, 500); // 500ms de delay
};

const seleccionarTercero = (tercero) => {
    tercero_seleccionado.value = tercero.nit;
    tercero_busqueda.value = tercero.nombres;
    mostrar_dropdown_terceros.value = false;
};

const limpiarTercero = () => {
    tercero_seleccionado.value = null;
    tercero_busqueda.value = "";
    list_terceros.value = [];
    mostrar_dropdown_terceros.value = false;
};

const toggleNegociador = (usuario) => {
    const index = negociador.value.indexOf(usuario);
    if (index > -1) {
        // Si ya está seleccionado, lo quitamos
        negociador.value.splice(index, 1);
    } else {
        // Si no está seleccionado, lo agregamos
        negociador.value.push(usuario);
    }
};

const mostrarSolicitudes = async () => {
    try {
        const solicitante_filtro = es_solicitante_normal.value ? usuario_creador.value : filtro_solicitante.value;
        const response = await axios.post(
            `${apiUrl}/mostrar_solicitudes`, 
            {
                solicitud_id: filtro_id_solicitud.value,
                estado_solicitud: filtro_estado_solicitud.value,
                solicitante: solicitante_filtro,
                negociador: filtro_negociador.value,
                cotizado: filtro_cotizado.value,
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

const limpiarCampos = () => {
    productos.value = [{ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "", cotizado: 0, negociador: null }];
    negociador.value = [];
    limpiarTercero();
    asunto.value = "";
    cuerpo_texto.value = "";
    mostrarErrores.value = false; // Resetear los errores de validación

    // Restablece el tamaño del textarea usando el ref
    if (textarea.value) {
        textarea.value.style.height = "auto"; // vuelve al tamaño original
    }
};

const limpiarCamposFiltro = async () => {
  const anio = new Date().getFullYear();
  filtro_id_solicitud.value = "";
  filtro_estado_solicitud.value = null;
  filtro_solicitante.value = es_solicitante_normal.value ? usuario_creador.value : null;
  filtro_negociador.value = [];
  filtro_cotizado.value = null;
  filtro_fecha_desde.value = `${anio}-01-01`;
  filtro_fecha_hasta.value = `${anio}-12-31`;
  filtro_fan.value = null;
  await mostrarSolicitudes();
};

const toggleFiltroFan = (valor) => {
    if (filtro_fan.value === valor) {
        filtro_fan.value = null;
    } else {
        filtro_fan.value = valor;
    }
    mostrarSolicitudes();
};

const toggleNegociadorFiltro = (negociador_param) => {
    const index = filtro_negociador.value.indexOf(negociador_param);
    if (index > -1) {
        filtro_negociador.value.splice(index, 1);
    } else {
        filtro_negociador.value.push(negociador_param);
    }
};

function agregarRow() {
    productos.value.push({ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "", cotizado: 0, negociador: null });
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
function mostrarDetalles(detalles, cuerpo_texto, asunto, estado, fecha_resuelto, mensaje_resuelto) {
    detallesSolicitud.value = detalles;
    asuntoTexto.value = asunto;
    cuerpoTexto.value = cuerpo_texto;
    estadoSolicitud.value = estado;
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

// ✅ Función para descargar el archivo del template excel
const descargarArchivo = () => {
  const link = document.createElement('a');
  link.href = '/template_solicitud.xlsx'; // Ruta relativa desde /public
  link.download = 'template_solicitud.xlsx'; // Nombre sugerido al descargar
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function logout() {
    try {
        localStorage.clear();
        router.push('/'); // Redirigir al login
        
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

function abrirModalProductos() {
  if (!productosModalInstance.value) {
    productosModalInstance.value = new Modal(productosModal.value);
  }
  productosModalInstance.value.show();
}

// ✅ Watcher que auto-detecta negociadores únicos desde las filas de productos
watch(productos, (nuevosProductos) => {
  const unicos = [...new Set(
    nuevosProductos
      .map(p => p.negociador)
      .filter(n => n !== null && n !== undefined && n !== '')
  )];
  negociador.value = unicos;
}, { deep: true });

// ✅ Watcher para mostrarAcordeonProductos
watch(mostrarAcordeonProductos, (nuevoValor) => {
  if (nuevoValor) {
    // Si se habilita el checkbox, reinicia productos a su estado inicial
    productos.value = [{ referencia: "", producto: "", cantidad: "", proveedor: "", marca: "", cotizado: 0, negociador: null }];
  } else {
    // Si se deshabilita el checkbox, limpia el input file
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    archivoSeleccionado.value = null;
  }
});

// ✅ Función mounted que carga información ANTES de que la página renderice
onMounted(() => {
  token.value = localStorage.getItem("token");
  usuario_creador.value = localStorage.getItem("usuario_creador");
  es_solicitante_normal.value = localStorage.getItem("es_solicitante_normal") === "true";
  if (es_solicitante_normal.value) {
    filtro_solicitante.value = usuario_creador.value;
  }

  modalInstance.value = new Modal(exitoModal);
  modalErrorInstance.value = new Modal(errorModal);
  modalDetallesInstance.value = new Modal(detallesModal);
  productosModalInstance.value = new Modal(productosModal);

  if (!token.value) {
      router.push('/'); // Redirigir al login si no hay token
  }

  cargarDatos();
  cargarSolicitantes();
  mostrarEstadosSolicitud();
  mostrarSolicitudes();

  // Listener para cerrar dropdown de terceros al hacer click fuera
  document.addEventListener('click', cerrarDropdownTerceros);
});

// Limpiar listener al desmontar componente
onUnmounted(() => {
  document.removeEventListener('click', cerrarDropdownTerceros);
});

// Función para cerrar dropdown cuando se hace click fuera
const cerrarDropdownTerceros = (event) => {
  const terceroContainer = event.target.closest('.form-group');
  if (!terceroContainer || !terceroContainer.querySelector('.terceros-dropdown')) {
    mostrar_dropdown_terceros.value = false;
  }
  // Cerrar dropdown de negociadores si se hace click fuera
  if (!terceroContainer || !terceroContainer.querySelector('.negociadores-dropdown')) {
    const clickedMultiselect = event.target.closest('.custom-multiselect');
    if (!clickedMultiselect) {
      mostrar_dropdown_negociadores.value = false;
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

/* Nuevo: contenedor para los botones a la derecha */
.header-buttons {
  display: flex;
  gap: 10px; /* Espacio entre los botones */
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

/* Estilos para select múltiple */
select[multiple].input-field {
  min-height: 80px;
  padding: 4px;
}

select[multiple].input-field option {
  padding: 6px 8px;
  margin: 2px 0;
  border-radius: 3px;
  cursor: pointer;
}

select[multiple].input-field option:hover {
  background-color: #e3f2fd;
}

select[multiple].input-field option:checked {
  background: linear-gradient(0deg, #2778bf 0%, #4385be 100%);
  color: white;
  font-weight: 500;
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

.container-n {
    width: 80%;
    margin: 0 auto;
    height: calc(100vh - 120px);
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
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
    color: #2778bf;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 3px solid transparent;
    border-image: linear-gradient(90deg, #2778bf, #4385be, transparent) 1;
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
    background: linear-gradient(90deg, #2778bf, #4385be);
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
    background: linear-gradient(135deg, #2778bf 0%, #1e5a8f 100%);
    color: white;
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
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.modal-body table th {
    background: linear-gradient(135deg, #2778bf 0%, #1e5a8f 100%);
    color: white;
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
    background: #fafbfc;
}

tbody tr:hover {
    background: linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%);
    transform: scale(1.01);
    box-shadow: 0 4px 12px rgba(39, 120, 191, 0.15);
    cursor: pointer;
}

tbody tr:hover td {
    color: #1e5a8f;
    font-weight: 500;
}

tbody tr td:first-child {
    font-weight: 600;
    color: #2778bf;
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
    background: rgba(39, 120, 191, 0.1);
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.action-icon:hover {
    transform: scale(1.3) rotate(10deg);
    background: rgba(39, 120, 191, 0.2);
    filter: drop-shadow(0 2px 6px rgba(39, 120, 191, 0.4));
}

.action-icon:active {
    transform: scale(1.1);
}

tbody tr td i:hover {
    transform: scale(1.3);
    filter: drop-shadow(0 2px 4px rgba(39, 120, 191, 0.4));
}

.no-registros {
    text-align: center;
    font-weight: 600;
    color: #999;
    padding: 32px;
    font-size: 1rem;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
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

.logout-button {
    background-color: #2778bf; /* Azul similar a otros elementos */
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background 0.3s;
}

.logout-button:hover {
    background-color: #4385be; /* Azul más claro al pasar el cursor */
}

.logout-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.template-button {
    width: 200px;
    background-color: #679b3a;
}

.template-button:hover {
    background-color: #487223;
}

.error .input-field {
    border-color: red;
    background-color: #ffe6e6;
}

.input-field--error {
    border-color: red !important;
    background-color: #ffe6e6 !important;
}

/* Campo de negociadores de solo lectura (auto-detectado) */
.negociadores-readonly {
  width: 100%;
  min-height: 38px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: #f9fafb;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  cursor: default;
  transition: border-color 0.2s;
}

.negociadores-readonly--error {
  border-color: red;
  background-color: #ffe6e6;
}

.negociadores-readonly__placeholder {
  color: #aaa;
  font-size: 0.88em;
  font-style: italic;
}

.negociador-chip {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #2778bf 0%, #4385be 100%);
  color: white;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.82em;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(39,120,191,0.25);
}

.required-fields-note {
    font-size: 0.85em;
    color: #555;
    margin-bottom: 8px;
}

.error-text {
    color: red;
    font-size: 0.85em;
    margin-top: 4px;
}

.spinner {
    border: 2px solid #f3f3f3; /* Color gris claro */
    border-top: 2px solid #2778bf; /* Azul */
    border-radius: 50%;
    width: 16px;
    height: 16px;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 8px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Scroll para la tabla de productos en la modal */
.productos-table-scroll {
  max-height: 350px;
  overflow-y: auto;
}

/* Ajuste para el botón agregar dentro de la modal */
#productosModal .round-button {
  margin-left: 0;
  margin-top: 0;
  background-color: #2778bf;
  color: white;
  border: none;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

#productosModal .round-button:hover {
  background-color: #4385be;
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

/* Estilos para el dropdown de terceros */
.terceros-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 2px;
}

.tercero-item {
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
}

.tercero-item:last-child {
  border-bottom: none;
}

.tercero-item:hover {
  background-color: #f3f4f6;
  color: #2778bf;
}

/* Estilos para clientes fan */
.tercero-item.tercero-fan {
  background: linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%);
  border-left: 3px solid #FFD700;
  font-weight: 500;
  position: relative;
}

.tercero-item.tercero-fan:hover {
  background: linear-gradient(135deg, #fff4d1 0%, #fff9e6 100%);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2);
  color: #2778bf;
}

.tercero-item.tercero-fan::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #FFD700 0%, #FFA500 100%);
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
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

@keyframes fan-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
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

.kpi-total     { border-left-color: #2778bf; }
.kpi-nuevas    { border-left-color: #17a2b8; }
.kpi-proceso   { border-left-color: #ffb300; }
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

.kpi-total    .kpi-icon { background: #e8f0fb; color: #2778bf; }
.kpi-nuevas   .kpi-icon { background: #e0f7fa; color: #17a2b8; }
.kpi-proceso  .kpi-icon { background: #fff8e1; color: #ffb300; }
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

.kpi-items {
    font-size: 0.72rem;
    color: #9ca3af;
    font-weight: 500;
    margin-top: 3px;
    display: flex;
    align-items: center;
}

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
