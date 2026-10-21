import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

export type Role = 'UTILISATEUR' | 'MODERATEUR';
export type TypeIncident = 'INTER_URBAIN' | 'DOMESTIQUE';
export type StatutIncident = 'NOUVEAU' | 'PRIORITAIRE' | 'EN_COURS' | 'RESOLU' | 'CLOTURE';

export interface Categorie {
  id: string;
  nom: string;
  description?: string;
  imageUrl?: string;
}

export interface Incident {
  id: string;
  titre: string;
  description: string;
  type: TypeIncident;
  categorieId: string;
  localisation: string;
  statut: StatutIncident;
  auteurId: string;
  auteurNom: string;
  dateCreation: string;
  dateDerniereModification: string;
}

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: Role;
  dateCreation: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="app-container">
      <!-- NAVBAR PUBLIQUE -->
      <nav *ngIf="currentView() !== 'dashboard'" class="top-navbar">
        <div class="nav-brand" (click)="setView('accueil')">
          <div class="brand-symbol">VC</div>
          <div class="brand-text">
            <span class="brand-title">VigieCam</span>
            <span class="brand-sub">MbemNova Civic Services</span>
          </div>
        </div>

        <div class="nav-links">
          <a class="nav-link" (click)="setView('accueil')">Accueil</a>
          <a class="nav-link" (click)="scrollTo('fonctionnement')">Comment ça marche</a>
          <a class="nav-link" (click)="scrollTo('categories')">Catégories</a>
          <a class="nav-link" (click)="scrollTo('urgences')">Urgences</a>
        </div>

        <div class="nav-actions">
          <button class="btn-nav-outline" (click)="setView('connexion')">Espace Modérateur</button>
          <button class="btn-nav-primary" (click)="setView('connexion')">Se connecter</button>
        </div>
      </nav>

      <!-- ACCUEIL PUBLIQUE -->
      <div *ngIf="currentView() === 'accueil'" class="public-landing">
        <section class="hero-section">
          <div class="hero-text">
            <span class="tag-civique">MbemNova · Signalement Citoyen</span>
            <h1>Un signalement à temps peut éviter le pire</h1>
            <p>Plateforme municipale de prévention, d'alerte et de suivi des incidents domestiques et inter-urbains au Cameroun.</p>
            <div class="hero-actions">
              <button class="btn-primary" (click)="setView('connexion')">Signaler un incident</button>
              <button class="btn-secondary" (click)="scrollTo('fonctionnement')">Découvrir le projet</button>
            </div>
          </div>

          <div class="carousel-container" id="categories">
            <div class="carousel-slide" [style.background-image]="'url(' + categories()[activeSlide()].imageUrl + ')'">
              <div class="slide-overlay">
                <span class="slide-badge">Signalisation prioritaire</span>
                <h3>{{ categories()[activeSlide()].nom }}</h3>
                <p>{{ categories()[activeSlide()].description }}</p>
                <div class="slide-timer-bar"></div>
              </div>
            </div>
            <div class="carousel-dots">
              <span *ngFor="let cat of categories(); let i = index"
                    [class.active]="i === activeSlide()"
                    (click)="activeSlide.set(i)"></span>
            </div>
          </div>
        </section>

        <!-- SECTION IMPACT -->
        <section class="impact-section">
          <div class="impact-card">
            <h3>+12 400</h3>
            <p>Citoyens connectés</p>
          </div>
          <div class="impact-card">
            <h3>98.2%</h3>
            <p>Taux de prise en charge</p>
          </div>
          <div class="impact-card">
            <h3>4.2h</h3>
            <p>Délai moyen d'intervention</p>
          </div>
          <div class="impact-card">
            <h3>24/7</h3>
            <p>Veille et modération active</p>
          </div>
        </section>

        <section class="steps-section" id="fonctionnement">
          <div class="section-title">
            <h2>Comment fonctionne VigieCam ?</h2>
            <p>Un parcours citoyen simple, rapide et sécurisé en 3 étapes clés</p>
          </div>
          <div class="steps-grid">
            <div class="step-box">
              <div class="step-num">01</div>
              <h4>Signalez l'incident</h4>
              <p>Remplissez le formulaire en décrivant la situation, le type (inter-urbain ou domestique) et la localisation exacte.</p>
            </div>
            <div class="step-box">
              <div class="step-num">02</div>
              <h4>Modération en temps réel</h4>
              <p>Les équipes et modérateurs municipaux reçoivent l'alerte instantanément et évaluent le niveau d'urgence (SLA).</p>
            </div>
            <div class="step-box">
              <div class="step-num">03</div>
              <h4>Intervention & Suivi</h4>
              <p>Suivez l'évolution du dossier en direct jusqu'à sa résolution complète par les services compétents.</p>
            </div>
          </div>
        </section>

        <section class="urgences-banner" id="urgences">
          <div class="urg-card">
            <h4>Police Secours</h4>
            <span class="urg-num">117</span>
          </div>
          <div class="urg-card">
            <h4>Sapeurs-Pompiers</h4>
            <span class="urg-num">118</span>
          </div>
          <div class="urg-card">
            <h4>Gendarmerie Nationale</h4>
            <span class="urg-num">113</span>
          </div>
          <div class="urg-card">
            <h4>SAMU / Urgence Médicale</h4>
            <span class="urg-num">119</span>
          </div>
        </section>
      </div>

      <!-- PAGE DE CONNEXION -->
      <div *ngIf="currentView() === 'connexion'" class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Espace Citoyen & Modération</h2>
            <p>Accédez à la gestion et au suivi en temps réel</p>
          </div>
          <form [formGroup]="authForm" (ngSubmit)="onLogin()">
            <div class="form-group">
              <label>Nom complet</label>
              <input type="text" formControlName="nom" placeholder="Ex: Modérateur Test" />
            </div>
            <div class="form-group">
              <label>Adresse E-mail</label>
              <input type="email" formControlName="email" placeholder="Ex: moderateur@vigiecam.cm" />
              <small class="hint">Indiquez 'moderateur@vigiecam.cm' pour le rôle Modérateur.</small>
            </div>
            <button type="submit" [disabled]="authForm.invalid" class="btn-primary w-100">
              Accéder au Portail VigieCam
            </button>
          </form>
        </div>
      </div>

      <!-- DASHBOARD CIVICOS -->
      <div *ngIf="currentUser() && currentView() === 'dashboard'" class="civicos-layout">
        <aside class="sidebar-dark">
          <div class="sidebar-header-custom">
            <div class="brand-icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div class="brand-text-box">
              <h2 class="brand-title">VigieCam</h2>
              <span class="brand-subtitle">Signaler et suivre</span>
            </div>
          </div>

          <nav class="sidebar-menu">
            <div class="menu-section-label" *ngIf="currentUser()?.role === 'MODERATEUR'">Modération</div>

            <a class="menu-item" *ngIf="currentUser()?.role === 'MODERATEUR'"
               [class.active]="currentTab() === 'overview'"
               (click)="currentTab.set('overview')">
              <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Tableau de bord</span>
            </a>

            <a class="menu-item" *ngIf="currentUser()?.role === 'MODERATEUR'"
               [class.active]="currentTab() === 'categories'"
               (click)="currentTab.set('categories')">
              <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>Catégories</span>
            </a>

            <div class="menu-section-label">Espace citoyen</div>

            <a class="menu-item"
               [class.active]="currentTab() === 'mes-signalements'"
               (click)="currentTab.set('mes-signalements')">
              <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              <span>Mes signalements</span>
            </a>

            <a class="menu-item" (click)="showNewModal.set(true)">
              <svg class="item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Signaler un incident</span>
            </a>
          </nav>

          <div class="sidebar-user-bottom">
            <div class="user-card-box" (click)="currentTab.set('profil')">
              <div class="user-avatar-badge">{{ getUserInitials() }}</div>
              <div class="user-info-text">
                <span class="user-name-text">{{ currentUser()?.nom }}</span>
                <span class="user-role-badge" [class.mod-badge]="currentUser()?.role === 'MODERATEUR'">
                  {{ currentUser()?.role === 'MODERATEUR' ? 'Modérateur' : 'Utilisateur' }}
                </span>
              </div>
            </div>

            <button class="btn-logout-full" (click)="logout()">Se déconnecter</button>
          </div>
        </aside>

        <!-- CONTENU DU DASHBOARD -->
        <main class="main-content">
          <header class="top-header">
            <div class="header-left">
              <h1 *ngIf="currentTab() === 'categories'">Gestion des Catégories</h1>
              <h1 *ngIf="currentTab() === 'profil'">Mon Profil</h1>
              <h1 *ngIf="currentTab() === 'mes-signalements'">Mes Signalements</h1>
              <h1 *ngIf="currentTab() === 'overview'">Tableau de bord - Vue d'ensemble</h1>

              <div class="header-sub-info">
                <span class="date-pill">{{ formattedCurrentDate }}</span>
                <span class="sla-pill" *ngIf="countPrioritaire() > 0 && currentTab() !== 'categories'">
                  RISQUE SLA : {{ countPrioritaire() }} cas
                </span>
              </div>
            </div>
            <div class="header-right">
              <button class="btn-new-case" (click)="showNewModal.set(true)">+ Nouveau signalement</button>
            </div>
          </header>

          <!-- VUE GESTION DES CATÉGORIES -->
          <div *ngIf="currentTab() === 'categories'" class="categories-view">
            <div class="cat-header-action">
              <h3>Catégories d'incidents configurées</h3>
              <button class="btn-primary" (click)="showNewCatModal.set(true)">+ Ajouter une catégorie</button>
            </div>

            <div class="cat-grid">
              <div *ngFor="let cat of categories()" class="cat-card">
                <div class="cat-img" [style.background-image]="'url(' + cat.imageUrl + ')'"></div>
                <div class="cat-body">
                  <h4>{{ cat.nom }}</h4>
                  <p>{{ cat.description }}</p>
                  <span class="cat-count">{{ getCountForCat(cat.id) }} incident(s) signalé(s)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- VUE PROFIL UTILISATEUR -->
          <div *ngIf="currentTab() === 'profil'" class="profile-section">
            <div class="profile-card">
              <div class="profile-header-box">
                <div class="profile-big-avatar">{{ getUserInitials() }}</div>
                <div>
                  <h2>{{ currentUser()?.nom }}</h2>
                  <p class="profile-email">{{ currentUser()?.email }}</p>
                </div>
              </div>
              <div class="profile-details">
                <div class="detail-row">
                  <span>Rôle sur la plateforme :</span>
                  <strong [class.mod-role]="currentUser()?.role === 'MODERATEUR'">{{ currentUser()?.role }}</strong>
                </div>
                <div class="detail-row">
                  <span>ID Utilisateur :</span>
                  <code>{{ currentUser()?.id }}</code>
                </div>
                <div class="detail-row">
                  <span>Total signalements soumis :</span>
                  <strong>{{ countUserIncidents() }}</strong>
                </div>
              </div>
              <button class="btn-secondary mt-20" (click)="currentTab.set('overview')">Retour au tableau de bord</button>
            </div>
          </div>

          <!-- VUE TABLEAU DE BORD GLOBAL ET MES SIGNALEMENTS -->
          <ng-container *ngIf="currentTab() === 'overview' || currentTab() === 'mes-signalements'">
            <section class="kpi-grid">
              <div class="kpi-card open-cases">
                <span class="kpi-label">DOSSIERS OUVERTS</span>
                <div class="kpi-value">{{ countOuverts() }}</div>
                <span class="kpi-sub">Dans tous les secteurs</span>
              </div>
              <div class="kpi-card resolved-today">
                <span class="kpi-label">RÉSOLUS AUJOURD'HUI</span>
                <div class="kpi-value">{{ countResolus() }}</div>
                <span class="kpi-sub green">+8% d'efficacité</span>
              </div>
              <div class="kpi-card avg-response">
                <span class="kpi-label">DÉLAI MOYEN</span>
                <div class="kpi-value">4.2h</div>
                <span class="kpi-sub">Cible SLA : 6h (Conforme)</span>
              </div>
              <div class="kpi-card satisfaction">
                <span class="kpi-label">SATISFACTION</span>
                <div class="kpi-value">4.6<small>/5</small></div>
                <span class="kpi-sub blue">Sur 2 841 avis</span>
              </div>
              <div class="kpi-card sla-breached">
                <span class="kpi-label">PRIORITAIRES / SLA</span>
                <div class="kpi-value red">{{ countPrioritaire() }}</div>
                <span class="kpi-sub red">Attention immédiate</span>
              </div>
            </section>

            <section class="feed-section">
              <div class="feed-header">
                <h3>{{ currentTab() === 'mes-signalements' ? 'Mes signalements' : 'Toutes les demandes et incidents actifs' }}</h3>
              </div>

              <div class="feed-list">
                <div *ngFor="let inc of filteredIncidents()" class="incident-card">
                  <div class="card-top">
                    <span class="category-tag">{{ getCatName(inc.categorieId) }}</span>
                    <span class="status-badge" [attr.data-status]="inc.statut">{{ inc.statut }}</span>
                  </div>
                  <h4>{{ inc.titre }}</h4>
                  <p class="inc-desc">{{ inc.description }}</p>

                  <div class="card-meta">
                    <span><strong>Réf :</strong> #VC-2026-{{ inc.id.substring(0,5) }}</span>
                    <span><strong>Lieu :</strong> {{ inc.localisation }}</span>
                    <span><strong>Auteur :</strong> {{ inc.auteurNom }}</span>
                  </div>

                  <div class="progress-bar-container">
                    <div class="progress-bar" [style.width]="inc.statut === 'RESOLU' ? '100%' : inc.statut === 'EN_COURS' ? '65%' : '25%'"></div>
                  </div>

                  <div class="card-actions" *ngIf="currentUser()?.role === 'MODERATEUR'">
                    <button (click)="changeStatut(inc, 'EN_COURS')" class="btn-sm">Prendre en charge</button>
                    <button (click)="changeStatut(inc, 'RESOLU')" class="btn-sm green">Résoudre</button>
                  </div>
                </div>
              </div>
            </section>
          </ng-container>
        </main>
      </div>

      <!-- FOOTER -->
      <footer *ngIf="currentView() !== 'dashboard'" class="main-footer">
        <div class="footer-container">
          <div class="footer-col brand-col">
            <div class="footer-logo">VigieCam</div>
            <p>Plateforme municipale de signalement citoyen et de gestion d'incidents d'urgence. Projet développé pour MbemNova.</p>
          </div>

          <div class="footer-col">
            <h5>Navigation</h5>
            <ul>
              <li><a (click)="setView('accueil')">Accueil</a></li>
              <li><a (click)="setView('connexion')">Signaler un incident</a></li>
              <li><a (click)="setView('connexion')">Espace Modérateur</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Domaines d'intervention</h5>
            <ul>
              <li>Accidents Inter-Urbains</li>
              <li>Violences Domestiques</li>
              <li>Agressions & Vols</li>
              <li>Nuisances Sonores</li>
            </ul>
          </div>

          <div class="footer-col">
            <h5>Sécurité & Confidentialité</h5>
            <p>Données stockées localement sur le navigateur. Aucun serveur externe sollicité pour ce prototype.</p>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; 2026 VigieCam · MbemNova. Tous droits réservés.</p>
        </div>
      </footer>

      <!-- MODAL CRÉATION INCIDENT -->
      <div *ngIf="showNewModal()" class="modal-backdrop">
        <div class="modal-card">
          <h3>Signaler un incident</h3>
          <form [formGroup]="incidentForm" (ngSubmit)="onCreateIncident()">
            <div class="form-group">
              <label>Titre de l'incident</label>
              <input type="text" formControlName="titre" placeholder="Ex: Accident axe lourd" />
            </div>
            <div class="form-group">
              <label>Type d'incident</label>
              <select formControlName="type">
                <option value="INTER_URBAIN">Inter-Urbain</option>
                <option value="DOMESTIQUE">Domestique</option>
              </select>
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select formControlName="categorieId">
                <option *ngFor="let c of categories()" [value]="c.id">{{ c.nom }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Localisation</label>
              <input type="text" formControlName="localisation" placeholder="Ex: Akwa, Douala" />
            </div>
            <div class="form-group">
              <label>Description détaillée</label>
              <textarea formControlName="description" rows="4"></textarea>
            </div>
            <div class="modal-btns">
              <button type="button" class="btn-secondary" (click)="showNewModal.set(false)">Annuler</button>
              <button type="submit" [disabled]="incidentForm.invalid" class="btn-primary">Envoyer</button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL CRÉATION CATÉGORIE -->
      <div *ngIf="showNewCatModal()" class="modal-backdrop">
        <div class="modal-card">
          <h3>Ajouter une catégorie</h3>
          <form [formGroup]="categoryForm" (ngSubmit)="onCreateCategory()">
            <div class="form-group">
              <label>Nom de la catégorie</label>
              <input type="text" formControlName="nom" placeholder="Ex: Inondations & Sinistres" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea formControlName="description" rows="3" placeholder="Brève description..."></textarea>
            </div>
            <div class="form-group">
              <label>URL de l'image (Unsplash)</label>
              <input type="text" formControlName="imageUrl" placeholder="https://images.unsplash.com/..." />
            </div>
            <div class="modal-btns">
              <button type="button" class="btn-secondary" (click)="showNewCatModal.set(false)">Annuler</button>
              <button type="submit" [disabled]="categoryForm.invalid" class="btn-primary">Créer</button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
    .app-container { min-height: 100vh; background-color: #F4F6F9; color: #20242B; display: flex; flex-direction: column; position: relative; }

    /* NAVBAR */
    .top-navbar { height: 75px; background: #0D1B2A; color: white; display: flex; justify-content: space-between; align-items: center; padding: 0 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
    .nav-brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .brand-symbol { width: 40px; height: 40px; background: #2B6CB0; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; }
    .brand-text { display: flex; flex-direction: column; }
    .brand-title { font-size: 20px; font-weight: 700; color: white; line-height: 1.1; }
    .brand-sub { font-size: 11px; color: #90CDF4; font-weight: 500; }

    .nav-links { display: flex; gap: 28px; }
    .nav-link { color: #E2E8F0; text-decoration: none; font-size: 14px; font-weight: 500; cursor: pointer; transition: color 0.2s; }
    .nav-link:hover { color: #63B3ED; }

    .nav-actions { display: flex; gap: 12px; align-items: center; }
    .btn-nav-outline { background: transparent; border: 1px solid #4A5568; color: #E2E8F0; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-nav-primary { background: #2B6CB0; border: none; color: white; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }

    /* LANDING */
    .public-landing { padding: 50px 40px; max-width: 1200px; margin: 0 auto; flex: 1; width: 100%; }
    .hero-section { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center; margin-bottom: 60px; }
    .hero-text h1 { font-size: 42px; line-height: 1.15; margin: 20px 0; color: #121E2D; font-weight: 800; }
    .hero-text p { font-size: 18px; color: #4A5568; margin-bottom: 30px; line-height: 1.5; }
    .tag-civique { background: #E2E8F0; color: #2C5282; padding: 6px 14px; border-radius: 16px; font-size: 12px; font-weight: 700; }
    .hero-actions { display: flex; gap: 15px; }

    .carousel-container { position: relative; height: 400px; border-radius: 12px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.15); }
    .carousel-slide { width: 100%; height: 100%; background-size: cover; background-position: center; position: relative; }
    .slide-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(13,27,42,0.95)); color: white; padding: 30px; }
    .slide-badge { background: #3182CE; color: white; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .slide-overlay h3 { font-size: 22px; margin: 8px 0 4px; font-weight: 700; }
    .slide-overlay p { font-size: 14px; color: #CBD5E0; }
    .slide-timer-bar { height: 3px; background: #63B3ED; margin-top: 15px; animation: slideProgress 5s infinite linear; }
    @keyframes slideProgress { from { width: 0%; } to { width: 100%; } }
    .carousel-dots { position: absolute; top: 20px; right: 20px; display: flex; gap: 8px; }
    .carousel-dots span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; }
    .carousel-dots span.active { background: white; transform: scale(1.3); }

    .impact-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 60px; }
    .impact-card { background: white; padding: 25px; border-radius: 10px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border-bottom: 4px solid #2B6CB0; }
    .impact-card h3 { font-size: 32px; font-weight: 800; color: #121E2D; margin-bottom: 5px; }
    .impact-card p { font-size: 14px; color: #718096; font-weight: 600; }

    .steps-section { margin-bottom: 60px; }
    .section-title { text-align: center; margin-bottom: 40px; }
    .section-title h2 { font-size: 30px; color: #121E2D; font-weight: 800; margin-bottom: 8px; }
    .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; }
    .step-box { background: white; padding: 35px 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border-top: 4px solid #3182CE; }
    .step-num { font-size: 36px; font-weight: 900; color: #CBD5E0; margin-bottom: 15px; }
    .step-box h4 { font-size: 18px; color: #121E2D; font-weight: 700; margin-bottom: 10px; }

    .urgences-banner { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .urg-card { background: white; border-radius: 8px; padding: 20px; border-left: 5px solid #E53E3E; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .urg-card h4 { font-size: 13px; color: #718096; font-weight: 700; text-transform: uppercase; }
    .urg-num { font-size: 28px; font-weight: 800; color: #E53E3E; margin-top: 4px; display: block; }

    .main-footer { background: #0F172A; color: #94A3B8; padding: 50px 40px 20px; margin-top: auto; }
    .footer-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 40px; margin-bottom: 40px; }
    .footer-logo { font-size: 22px; font-weight: 800; color: white; margin-bottom: 12px; }
    .footer-col h5 { color: white; font-size: 14px; font-weight: 700; margin-bottom: 15px; text-transform: uppercase; }
    .footer-col ul { list-style: none; }
    .footer-col li { margin-bottom: 8px; font-size: 13px; }
    .footer-bottom { max-width: 1200px; margin: 0 auto; border-top: 1px solid #1E293B; padding-top: 20px; text-align: center; font-size: 12px; }

    .auth-page { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 75px); background: #0D1B2A; padding: 20px; }
    .auth-card { background: white; padding: 40px; border-radius: 12px; width: 100%; max-width: 440px; box-shadow: 0 15px 35px rgba(0,0,0,0.3); }

    /* DASHBOARD LAYOUT */
    .civicos-layout { display: flex; min-height: 100vh; width: 100%; }

    .sidebar-dark {
      width: 270px;
      min-width: 270px;
      background-color: #0A192F !important;
      color: #E2E8F0 !important;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-right: 1px solid #1E2D42;
    }

    .sidebar-header-custom { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; padding: 0 8px; }
    .brand-icon-box {
      width: 42px;
      height: 42px;
      background: #172A46;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64FFDA;
      border: 1px solid #233554;
    }
    .brand-text-box { display: flex; flex-direction: column; }
    .brand-title { color: #FFFFFF !important; font-size: 20px; font-weight: 800; font-family: 'Georgia', serif; line-height: 1.1; }
    .brand-subtitle { font-size: 12px; color: #8892B0; font-style: italic; }

    .sidebar-menu { display: flex; flex-direction: column; gap: 6px; }
    .menu-section-label {
      font-size: 13px;
      color: #8892B0 !important;
      font-style: italic;
      margin: 18px 0 8px 10px;
      font-family: 'Georgia', serif;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 8px;
      color: #CCD6F6 !important;
      text-decoration: none;
      font-size: 15px;
      font-family: 'Georgia', serif;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .menu-item .item-icon { width: 18px; height: 18px; color: #8892B0; transition: color 0.2s; }
    .menu-item:hover { background: #112240; color: #FFFFFF !important; }
    .menu-item.active { background: #1D3557; color: #FFFFFF !important; font-weight: bold; }
    .menu-item.active .item-icon { color: #FFFFFF; }

    .sidebar-user-bottom { margin-top: auto; border-top: 1px solid #172A46; padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
    .user-card-box {
      background: #112240;
      padding: 12px 14px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .user-card-box:hover { background: #172A46; }
    .user-avatar-badge {
      width: 42px;
      height: 42px;
      background: #B4D330;
      color: #0A192F;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 15px;
    }
    .user-info-text { display: flex; flex-direction: column; gap: 2px; }
    .user-name-text { color: #FFFFFF; font-size: 15px; font-weight: 700; font-family: 'Georgia', serif; }
    .user-role-badge {
      font-size: 11px;
      background: #233554;
      color: #8892B0;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      width: fit-content;
    }
    .user-role-badge.mod-badge { background: #3E3B18; color: #E6C200; font-weight: 600; }

    .btn-logout-full {
      width: 100%;
      padding: 12px;
      background: transparent;
      border: 1px solid #233554;
      color: #CCD6F6;
      border-radius: 8px;
      font-size: 14px;
      font-family: 'Georgia', serif;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout-full:hover { background: #172A46; border-color: #304C7A; color: white; }

    .main-content { flex: 1; padding: 30px; background-color: #F8FAFC; overflow-y: auto; }
    .top-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
    .header-left h1 { font-size: 26px; color: #0F172A; font-weight: 700; margin-bottom: 6px; }
    .header-sub-info { display: flex; align-items: center; gap: 10px; }
    .date-pill { background: #E2E8F0; color: #475569; font-size: 12px; padding: 4px 10px; border-radius: 12px; }
    .sla-pill { background: #FEE2E2; color: #991B1B; font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 700; }

    .btn-new-case { background: #2563EB; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; }

    .cat-header-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .cat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
    .cat-card { background: white; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
    .cat-img { height: 140px; background-size: cover; background-position: center; }
    .cat-body { padding: 16px; }
    .cat-body h4 { font-size: 16px; color: #0F172A; margin-bottom: 6px; }
    .cat-body p { font-size: 13px; color: #64748B; margin-bottom: 12px; line-height: 1.4; }
    .cat-count { font-size: 11px; background: #EFF6FF; color: #1D4ED8; padding: 4px 8px; border-radius: 4px; font-weight: 600; }

    .profile-section { display: flex; justify-content: center; margin-top: 30px; }
    .profile-card { background: white; padding: 40px; border-radius: 12px; width: 100%; max-width: 600px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .profile-header-box { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; border-bottom: 1px solid #E2E8F0; padding-bottom: 20px; }
    .profile-big-avatar { width: 70px; height: 70px; background: #2563EB; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
    .profile-email { color: #64748B; font-size: 14px; margin-top: 4px; }
    .profile-details { display: flex; flex-direction: column; gap: 15px; }
    .detail-row { display: flex; justify-content: space-between; font-size: 14px; color: #475569; padding: 8px 0; border-bottom: 1px dashed #E2E8F0; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .kpi-card { background: white; padding: 20px; border-radius: 8px; border-top: 4px solid #CBD5E0; box-shadow: 0 2px 4px rgba(0,0,0,0.04); }
    .kpi-card.open-cases { border-top-color: #2563EB; }
    .kpi-card.resolved-today { border-top-color: #16A34A; }
    .kpi-card.avg-response { border-top-color: #D97706; }
    .kpi-card.satisfaction { border-top-color: #2563EB; }
    .kpi-card.sla-breached { border-top-color: #DC2626; }
    .kpi-label { font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 0.5px; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #0F172A; margin: 8px 0 4px; }
    .kpi-value.red { color: #DC2626; }
    .kpi-sub { font-size: 12px; color: #64748B; }
    .kpi-sub.green { color: #16A34A; font-weight: 600; }
    .kpi-sub.red { color: #DC2626; font-weight: 600; }
    .kpi-sub.blue { color: #2563EB; font-weight: 600; }

    .feed-header h3 { font-size: 18px; color: #0F172A; margin-bottom: 15px; }
    .incident-card { background: white; padding: 22px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #E2E8F0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .card-top { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .category-tag { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; background: #F1F5F9; padding: 3px 8px; border-radius: 4px; }
    .status-badge { font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: #E2E8F0; color: #334155; }
    .status-badge[data-status="PRIORITAIRE"] { background: #FEE2E2; color: #991B1B; }
    .status-badge[data-status="EN_COURS"] { background: #DCFCE7; color: #166534; }
    .status-badge[data-status="RESOLU"] { background: #DBEAFE; color: #1E40AF; }
    .incident-card h4 { font-size: 16px; color: #0F172A; margin-bottom: 6px; font-weight: 700; }
    .inc-desc { font-size: 14px; color: #475569; margin-bottom: 12px; }
    .card-meta { display: flex; gap: 20px; font-size: 13px; color: #64748B; margin-bottom: 12px; }
    .progress-bar-container { height: 6px; background: #F1F5F9; border-radius: 3px; margin: 12px 0; overflow: hidden; }
    .progress-bar { height: 100%; background: #2563EB; border-radius: 3px; transition: width 0.3s ease; }
    .card-actions { display: flex; gap: 10px; margin-top: 10px; }
    .btn-sm { padding: 6px 12px; font-size: 12px; border: none; background: #2563EB; color: white; border-radius: 4px; cursor: pointer; font-weight: 600; }
    .btn-sm.green { background: #16A34A; }

    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-size: 13px; font-weight: 600; color: #334155; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #CBD5E1; border-radius: 6px; font-size: 14px; }
    .hint { font-size: 11px; color: #64748B; margin-top: 4px; display: block; }
    .modal-backdrop { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:1000; }
    .modal-card { background: white; padding: 30px; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
    .modal-card h3 { margin-bottom: 20px; color: #0F172A; }
    .modal-btns { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .btn-primary { background: #2563EB; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: #E2E8F0; color: #475569; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .w-100 { width: 100%; }
    .mt-20 { margin-top: 20px; }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  currentView = signal<'accueil' | 'connexion' | 'dashboard'>('accueil');
  currentTab = signal<'overview' | 'categories' | 'mes-signalements' | 'profil'>('overview');
  currentUser = signal<Utilisateur | null>(null);
  showNewModal = signal<boolean>(false);
  showNewCatModal = signal<boolean>(false);
  activeSlide = signal<number>(0);

  incidents = signal<Incident[]>([]);
  categories = signal<Categorie[]>([]);

  // Date dynamique gérée automatiquement
  formattedCurrentDate = '';

  fb = inject(FormBuilder);
  authForm!: FormGroup;
  incidentForm!: FormGroup;
  categoryForm!: FormGroup;
  private slideInterval: any;

  ngOnInit() {
    // Génération de la date dynamique du jour (ex: "Mercredi 21 Octobre 2026")
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    this.formattedCurrentDate = new Date().toLocaleDateString('fr-FR', options);
    // Première lettre en majuscule
    this.formattedCurrentDate = this.formattedCurrentDate.charAt(0).toUpperCase() + this.formattedCurrentDate.slice(1);

    // Chargement initial avec LocalStorage
    const savedIncidents = localStorage.getItem('vigiecam_incidents');
    if (savedIncidents) {
      this.incidents.set(JSON.parse(savedIncidents));
    } else {
      const defaultIncidents: Incident[] = [
        {
          id: '101',
          titre: 'Collision Axe Lourd Douala-Yaoundé',
          description: 'Accident entre deux véhicules de transport. Secours demandés rapidement.',
          type: 'INTER_URBAIN',
          categorieId: '1',
          localisation: 'Axe Lourd Km 45',
          statut: 'PRIORITAIRE',
          auteurId: 'usr1',
          auteurNom: 'Patrice K.',
          dateCreation: new Date().toISOString(),
          dateDerniereModification: new Date().toISOString()
        }
      ];
      this.incidents.set(defaultIncidents);
      localStorage.setItem('vigiecam_incidents', JSON.stringify(defaultIncidents));
    }

    const savedCategories = localStorage.getItem('vigiecam_categories');
    if (savedCategories) {
      this.categories.set(JSON.parse(savedCategories));
    } else {
      const defaultCategories: Categorie[] = [
        { id: '1', nom: 'Accidents Inter-Urbains', description: 'Collisions et sécurité routière sur les axes lourds', imageUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=800' },
        { id: '2', nom: 'Violences Domestiques', description: 'Assistance, écoute et signalement d’urgence sécurisée', imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800' },
        { id: '3', nom: 'Agressions & Vols', description: 'Atteintes aux personnes et aux biens en zone urbaine', imageUrl: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?w=800' },
        { id: '4', nom: 'Nuisances & Tapages', description: 'Perturbations de la tranquillité publique et tapages nocturnes', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800' }
      ];
      this.categories.set(defaultCategories);
      localStorage.setItem('vigiecam_categories', JSON.stringify(defaultCategories));
    }

    this.authForm = this.fb.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.incidentForm = this.fb.group({
      titre: ['', [Validators.required, Validators.minLength(5)]],
      type: ['INTER_URBAIN', Validators.required],
      categorieId: ['1', Validators.required],
      localisation: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20)]]
    });

    this.categoryForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800', Validators.required]
    });

    this.slideInterval = setInterval(() => {
      this.activeSlide.update(curr => (curr + 1) % this.categories().length);
    }, 5000);
  }

  ngOnDestroy() {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  setView(view: 'accueil' | 'connexion' | 'dashboard') {
    this.currentView.set(view);
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  onLogin() {
    if (this.authForm.invalid) return;
    const email = this.authForm.value.email;
    const isMod = email.includes('moderateur');
    this.currentUser.set({
      id: crypto.randomUUID(),
      nom: this.authForm.value.nom,
      email: email,
      role: isMod ? 'MODERATEUR' : 'UTILISATEUR',
      dateCreation: new Date().toISOString()
    });
    this.currentView.set('dashboard');
    this.currentTab.set('overview');
  }

  logout() {
    this.currentUser.set(null);
    this.setView('accueil');
  }

  onCreateIncident() {
    if (this.incidentForm.invalid) return;
    const val = this.incidentForm.value;
    const newInc: Incident = {
      id: crypto.randomUUID(),
      titre: val.titre,
      description: val.description,
      type: val.type,
      categorieId: val.categorieId,
      localisation: val.localisation,
      statut: 'NOUVEAU',
      auteurId: this.currentUser()?.id || 'anon',
      auteurNom: this.currentUser()?.nom || 'Anonyme',
      dateCreation: new Date().toISOString(),
      dateDerniereModification: new Date().toISOString()
    };

    const updatedList = [newInc, ...this.incidents()];
    this.incidents.set(updatedList);
    localStorage.setItem('vigiecam_incidents', JSON.stringify(updatedList));

    this.showNewModal.set(false);
    this.incidentForm.reset({ type: 'INTER_URBAIN', categorieId: '1' });
  }

  onCreateCategory() {
    if (this.categoryForm.invalid) return;
    const val = this.categoryForm.value;
    const newCat: Categorie = {
      id: crypto.randomUUID(),
      nom: val.nom,
      description: val.description,
      imageUrl: val.imageUrl
    };

    const updatedCats = [...this.categories(), newCat];
    this.categories.set(updatedCats);
    localStorage.setItem('vigiecam_categories', JSON.stringify(updatedCats));

    this.showNewCatModal.set(false);
    this.categoryForm.reset();
  }

  changeStatut(inc: Incident, newStatut: StatutIncident) {
    const updatedList = this.incidents().map(i => i.id === inc.id ? { ...i, statut: newStatut } : i);
    this.incidents.set(updatedList);
    localStorage.setItem('vigiecam_incidents', JSON.stringify(updatedList));
  }

  getCatName(id: string): string {
    return this.categories().find(c => c.id === id)?.nom || 'Général';
  }

  getCountForCat(catId: string): number {
    return this.incidents().filter(i => i.categorieId === catId).length;
  }

  getUserInitials(): string {
    const nom = this.currentUser()?.nom || 'U';
    const parts = nom.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nom.substring(0, 2).toUpperCase();
  }

  filteredIncidents = computed(() => {
    const user = this.currentUser();
    const tab = this.currentTab();
    if (tab === 'mes-signalements' && user) {
      return this.incidents().filter(i => i.auteurId === user.id);
    }
    return this.incidents();
  });

  countUserIncidents = computed(() => {
    const user = this.currentUser();
    if (!user) return 0;
    return this.incidents().filter(i => i.auteurId === user.id).length;
  });

  countOuverts = computed(() => this.incidents().filter(i => i.statut !== 'RESOLU' && i.statut !== 'CLOTURE').length);
  countResolus = computed(() => this.incidents().filter(i => i.statut === 'RESOLU').length);
  countPrioritaire = computed(() => this.incidents().filter(i => i.statut === 'PRIORITAIRE').length);
}
