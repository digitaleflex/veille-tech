# Plan de stabilisation — TechPulse AI

Date de préparation : 2026-10-21  
Branche de travail : `chore/techpulse-cleanup-baseline`

## Objectif

Rendre l'application prévisible, sûre et vérifiable avant d'ajouter de nouvelles fonctionnalités. Ce plan est un document de travail : les cases ne sont cochées qu'après exécution et preuve de validation.

## Principes

- Ne pas modifier directement la branche de référence.
- Ne jamais exécuter de migration sur une base de production pendant la phase d'audit.
- Corriger par lots petits, isolés et réversibles.
- Associer chaque correction à un test de non-régression.
- Distinguer les contrôles statiques des tests réellement exécutés.
- Ne pas présenter une route ou un composant comme une fonctionnalité opérationnelle sans test de bout en bout.

## P0 — Sécurité et confidentialité

- [ ] Vérifier les autorisations sur toutes les lectures de revues, y compris date, intervalle, recherche, tendances, tags et partage.
- [x] Appliquer une règle de visibilité sur la route de liste des revues.
- [x] Retirer le contrôle de l'identité par paramètre utilisateur de la recherche et dériver l'identité depuis la session.
- [x] Limiter les statistiques à l'utilisateur connecté ou aux revues publiques.
- [x] Restreindre la page de détail aux revues publiques ou appartenant à l'utilisateur connecté.
- [x] Éviter l'injection HTML directe pour le champ d'analyse IA dans la page de détail.
- [ ] Ajouter des tests d'accès anonyme, propriétaire et autre utilisateur.
- [ ] Définir une politique de limitation de débit pour les routes publiques modifiant des compteurs.
- [ ] Vérifier la restitution et le stockage des clés API dans les réglages et intégrations.

## P1 — Persistance et cohérence métier

- [ ] Comparer `prisma/schema.prisma`, les migrations versionnées et la structure d'une base de test.
- [ ] Décider de la règle métier d'unicité des revues : globale par date ou par utilisateur et date.
- [ ] Faire persister les revues générées avant de répondre au client.
- [ ] Isoler le cache selon la visibilité et la personnalisation du contenu.
- [ ] Valider strictement les métadonnées produites par le modèle IA.
- [ ] Définir l'extraction des sources réelles et ne pas présenter des sources non vérifiées comme vérifiées.
- [ ] Définir le contrat de partage et vérifier l'autorisation de la ressource partagée.

## P1 — Qualité logicielle et livraison

- [x] Remplacer la CI principale par un workflow aligné sur la structure Next.js actuelle.
- [ ] Vérifier le lockfile, le typecheck, le schéma Prisma, les tests et le build sur un runner propre.
- [ ] Réparer la configuration ESLint et rendre le lint bloquant.
- [ ] Installer et configurer Playwright avant de réintroduire les tests E2E dans la CI.
- [x] Retirer les workflows hérités utilisant les dossiers `client/` et `server/`.
- [ ] Configurer un vrai déploiement seulement après validation de l'environnement cible, des secrets et de la stratégie de retour arrière.

## P2 — Interface et expérience

- [x] Retirer les métriques fictives du tableau de bord et afficher des états vides honnêtes en attendant les données réelles.
- [ ] Connecter le champ de recherche de la page d'accueil au parcours de recherche.
- [ ] Implémenter ou retirer les boutons d'action inertes sur la page de détail.
- [ ] Vérifier les états de chargement, vide, erreur et absence d'autorisation.
- [ ] Harmoniser la marque et les textes entre Eureka AI et TechPulse AI, ou choisir officiellement un nom unique.

## P2 — Documentation et maintenance

- [x] Aligner le README sur la stack déclarée actuelle.
- [ ] Corriger les liens de documentation cassés et vérifier les commandes d'installation.
- [ ] Cartographier les dépendances réellement utilisées et supprimer les dépendances mortes seulement après vérification.
- [x] Supprimer la route de test d'e-mail non essentielle, qui permettait à tout utilisateur authentifié de déclencher un envoi vers une adresse arbitraire.
- [ ] Remplacer les usages non nécessaires de `any` par des types explicites.
- [ ] Documenter les variables d'environnement sans valeurs secrètes.

## Critères de sortie avant livraison

1. Les contrôles d'accès passent les tests de non-régression.
2. Les migrations sont cohérentes sur une base de test vierge et sur une copie représentative.
3. TypeScript, lint, tests unitaires et build passent sur CI.
4. Les parcours de génération, persistance, consultation, recherche et partage sont validés.
5. Le déploiement est reproductible et dispose d'une procédure de retour arrière.
6. Aucun secret de test ou de production n'est commité.

## Limites de validation

Les changements marqués `[x]` indiquent des modifications de code ou de documentation effectuées dans la branche de nettoyage. Ils ne signifient pas que les tests d'exécution ont réussi. Les contrôles nécessitant un environnement Node.js, une base de données ou des secrets doivent rester non validés jusqu'à leur exécution effective.
