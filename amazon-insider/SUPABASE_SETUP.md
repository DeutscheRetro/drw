# 🚀 Supabase Setup für Deutsche Retro Werbung

## ✅ Schritt 1: Datenbank-Tabellen erstellen

Gehe zu deinem Supabase Dashboard: https://supabase.com/dashboard/project/jzkqhjadjalohqbhndaq

1. **Klicke auf "SQL Editor" im linken Menü**
2. **Kopiere das komplette SQL-Schema aus `supabase-schema.sql`**
3. **Füge es in den SQL Editor ein**
4. **Klicke "Run" um die Tabellen zu erstellen**

## 📋 Was wird erstellt:

### `products` Tabelle
- Speichert alle Amazon-Produkte
- Automatische UUIDs als Primary Keys
- Automatische Timestamps (created_at, updated_at)
- Status-Feld für aktive/inaktive Produkte

### `banners` Tabelle
- Speichert hochgeladene Banner-Bilder
- Base64-codierte Bilder (für Development)
- Aktiver Banner-Status

## 🔧 Features

✅ **Persistente Speicherung** - Keine Daten gehen beim Neustart verloren
✅ **Automatische URLs** - ASIN wird zu Amazon-Link mit Referral-Code
✅ **Banner Upload** - Bilder werden in der Datenbank gespeichert
✅ **Admin-Panel** - Vollständige Produktverwaltung
✅ **Performance** - Optimierte Indizes für schnelle Abfragen

## 🚨 Wichtig

Nach dem Erstellen der Tabellen ist die Website sofort bereit:
- Neue Produkte werden in Supabase gespeichert
- Banner-Uploads werden in der Datenbank gespeichert
- Alles bleibt auch nach Deployment-Neustarts erhalten

## 🎯 Migration von alten Daten

Die alten In-Memory-Daten sind beim ersten Start leer. Das ist normal und gewünscht - ab jetzt werden alle neuen Daten persistent in Supabase gespeichert.

## 🔍 Testen

1. Starte den Dev-Server: `bun run dev`
2. Gehe zum Admin-Panel: `/entry`
3. Füge ein Testprodukt hinzu
4. Lade die Seite neu - das Produkt sollte noch da sein! 🎉
