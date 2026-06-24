-- MySQL dump 10.13  Distrib 9.6.0, for macos26.4 (arm64)
--
-- Host: 127.0.0.1    Database: raktsetu
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'd6fb3c54-6f99-11f1-afe2-5396f5084a5c:1-491';

--
-- Table structure for table `alert_thresholds`
--

DROP TABLE IF EXISTS `alert_thresholds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alert_thresholds` (
  `hospital_id` int NOT NULL,
  `min_stock` int NOT NULL DEFAULT '10',
  `max_stock` int NOT NULL DEFAULT '100',
  `critical_units` int NOT NULL DEFAULT '5',
  `expiry_days` int NOT NULL DEFAULT '7',
  PRIMARY KEY (`hospital_id`),
  CONSTRAINT `fk_alert_thresholds_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alert_thresholds`
--

LOCK TABLES `alert_thresholds` WRITE;
/*!40000 ALTER TABLE `alert_thresholds` DISABLE KEYS */;
INSERT INTO `alert_thresholds` VALUES (1,10,100,5,7),(2,10,100,5,7),(4,15,120,8,7);
/*!40000 ALTER TABLE `alert_thresholds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actor_id` int DEFAULT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('info','warning','critical') COLLATE utf8mb4_unicode_ci DEFAULT 'info',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_actor` (`actor_id`),
  CONSTRAINT `fk_audit_actor` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,2,'Approved Kothrud Community Camp','info','10.24.8.12','2026-06-24 09:37:00'),(2,6,'Enabled emergency routing feature flag','info','192.168.1.102','2026-06-24 09:37:00'),(3,3,'Updated transfer request status for ID 3 to accepted','warning','::ffff:127.0.0.1','2026-06-24 09:37:01');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blood_batches`
--

DROP TABLE IF EXISTS `blood_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blood_batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hospital_id` int NOT NULL,
  `blood_group` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `units` int NOT NULL DEFAULT '0',
  `reserved_units` int NOT NULL DEFAULT '0',
  `collection_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `source` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Donation',
  `remarks` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_blood_batches_hosp_bg` (`hospital_id`,`blood_group`),
  KEY `idx_blood_batches_expiry` (`expiry_date`),
  CONSTRAINT `fk_blood_batches_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blood_batches`
--

LOCK TABLES `blood_batches` WRITE;
/*!40000 ALTER TABLE `blood_batches` DISABLE KEYS */;
INSERT INTO `blood_batches` VALUES (1,2,'A+',12,3,'2026-06-01','2026-07-06','Donation','First test batch'),(2,2,'O+',5,0,'2026-05-01','2026-06-10','Camp','Expired test batch'),(3,2,'B-',8,2,'2026-06-10','2026-07-15','Donation','B- batch'),(4,1,'O+',10,8,'2026-06-01','2026-08-30','Donation','KP batch'),(5,4,'A+',15,0,'2026-06-05','2026-07-10','Donation','Surat batch');
/*!40000 ALTER TABLE `blood_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `demo_requests`
--

DROP TABLE IF EXISTS `demo_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `demo_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_demo_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `demo_requests`
--

LOCK TABLES `demo_requests` WRITE;
/*!40000 ALTER TABLE `demo_requests` DISABLE KEYS */;
INSERT INTO `demo_requests` VALUES (1,'pilot@hospital.com','2026-06-24 07:18:11');
/*!40000 ALTER TABLE `demo_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `districts`
--

DROP TABLE IF EXISTS `districts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `districts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `officer_id` int DEFAULT NULL,
  `zone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_districts_officer` (`officer_id`),
  CONSTRAINT `fk_districts_officer` FOREIGN KEY (`officer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `districts`
--

LOCK TABLES `districts` WRITE;
/*!40000 ALTER TABLE `districts` DISABLE KEYS */;
INSERT INTO `districts` VALUES (1,'Pune','Maharashtra',4,'West'),(2,'Mumbai','Maharashtra',8,'West'),(3,'Surat','Gujarat',NULL,'West');
/*!40000 ALTER TABLE `districts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donation_camps`
--

DROP TABLE IF EXISTS `donation_camps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donation_camps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `camp_date` date NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` point NOT NULL /*!80003 SRID 4326 */,
  `district_id` int NOT NULL,
  `organizer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int DEFAULT NULL,
  `expected_donors` int DEFAULT NULL,
  `status` enum('upcoming','active','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'upcoming',
  PRIMARY KEY (`id`),
  SPATIAL KEY `idx_donation_camps_location` (`location`),
  KEY `idx_donation_camps_date` (`camp_date`),
  KEY `fk_donation_camps_district` (`district_id`),
  CONSTRAINT `fk_donation_camps_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donation_camps`
--

LOCK TABLES `donation_camps` WRITE;
/*!40000 ALTER TABLE `donation_camps` DISABLE KEYS */;
INSERT INTO `donation_camps` VALUES (1,'Kalyani Nagar Community Center Camp','2026-06-29','Kalyani Nagar, Pune',_binary '\æ\0\0\0\0\0\ÎQÚ‹2@\Òo_\ÎyR@',1,'Rotary Club Pune',100,50,'upcoming');
/*!40000 ALTER TABLE `donation_camps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donor_id` int NOT NULL,
  `hospital_id` int DEFAULT NULL,
  `camp_id` int DEFAULT NULL,
  `donation_date` date NOT NULL,
  `location_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `donation_type` enum('whole_blood','platelets','plasma') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'whole_blood',
  `units` int NOT NULL DEFAULT '1',
  `status` enum('completed','cancelled','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_donations_donor` (`donor_id`,`donation_date`),
  KEY `idx_donations_status` (`status`),
  KEY `fk_donations_hospital` (`hospital_id`),
  KEY `fk_donations_camp` (`camp_id`),
  CONSTRAINT `fk_donations_camp` FOREIGN KEY (`camp_id`) REFERENCES `donation_camps` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_donations_donor` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_donations_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `donors`
--

DROP TABLE IF EXISTS `donors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `donor_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `age` int NOT NULL,
  `gender` enum('Male','Female','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `blood_group` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `weight` decimal(5,2) NOT NULL,
  `chronic_illness` tinyint(1) DEFAULT '0',
  `last_donated_date` date DEFAULT NULL,
  `available_for_donation` tinyint(1) NOT NULL DEFAULT '1',
  `lat` decimal(10,8) NOT NULL DEFAULT '0.00000000',
  `lng` decimal(11,8) NOT NULL DEFAULT '0.00000000',
  `location` point NOT NULL /*!80003 SRID 4326 */,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `donor_code` (`donor_code`),
  SPATIAL KEY `idx_donors_location` (`location`),
  CONSTRAINT `fk_donors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donors`
--

LOCK TABLES `donors` WRITE;
/*!40000 ALTER TABLE `donors` DISABLE KEYS */;
INSERT INTO `donors` VALUES (1,1,'RS-2026-0001','Amit Sharma',28,'Male','Pune','411001','O+',70.00,0,'2026-03-01',1,18.52040000,73.85670000,_binary '\æ\0\0\0\0\0¡\Ö4\ï8…2@\íž<,\ÔvR@');
/*!40000 ALTER TABLE `donors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_pledges`
--

DROP TABLE IF EXISTS `emergency_pledges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_pledges` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donor_id` int NOT NULL,
  `emergency_id` int NOT NULL,
  `status` enum('pledged','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pledged',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pledge_donor_emergency` (`donor_id`,`emergency_id`),
  KEY `idx_pledges_emergency` (`emergency_id`,`status`),
  CONSTRAINT `fk_pledges_donor` FOREIGN KEY (`donor_id`) REFERENCES `donors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pledges_emergency` FOREIGN KEY (`emergency_id`) REFERENCES `emergency_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_pledges`
--

LOCK TABLES `emergency_pledges` WRITE;
/*!40000 ALTER TABLE `emergency_pledges` DISABLE KEYS */;
/*!40000 ALTER TABLE `emergency_pledges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emergency_requests`
--

DROP TABLE IF EXISTS `emergency_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emergency_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hospital_id` int NOT NULL,
  `blood_group` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `units` int NOT NULL,
  `target_timestamp` timestamp NOT NULL,
  `status` enum('pending','fulfilled','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `message` text COLLATE utf8mb4_unicode_ci,
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `location` point NOT NULL /*!80003 SRID 4326 */,
  PRIMARY KEY (`id`),
  SPATIAL KEY `idx_emergency_requests_location` (`location`),
  KEY `fk_emergency_hospital` (`hospital_id`),
  CONSTRAINT `fk_emergency_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emergency_requests`
--

LOCK TABLES `emergency_requests` WRITE;
/*!40000 ALTER TABLE `emergency_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `emergency_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forecasts`
--

DROP TABLE IF EXISTS `forecasts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forecasts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hospital_id` int NOT NULL,
  `blood_group` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `predicted_units` int NOT NULL,
  `forecast_date` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_forecasts_hosp_bg` (`hospital_id`,`blood_group`),
  CONSTRAINT `fk_forecasts_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forecasts`
--

LOCK TABLES `forecasts` WRITE;
/*!40000 ALTER TABLE `forecasts` DISABLE KEYS */;
INSERT INTO `forecasts` VALUES (1,1,'O+',6,'2026-06-25'),(2,1,'A+',4,'2026-06-25'),(3,2,'O+',8,'2026-06-25');
/*!40000 ALTER TABLE `forecasts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitals`
--

DROP TABLE IF EXISTS `hospitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hospitals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district_id` int NOT NULL,
  `type` enum('Government','Private','Trust','Semi-Govt') COLLATE utf8mb4_unicode_ci DEFAULT 'Private',
  `lat` decimal(10,8) NOT NULL,
  `lng` decimal(11,8) NOT NULL,
  `location` point NOT NULL /*!80003 SRID 4326 */,
  `license_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pincode` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_status` enum('pending','verified','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_no` (`license_no`),
  SPATIAL KEY `idx_hospitals_location` (`location`),
  KEY `fk_hospitals_district` (`district_id`),
  CONSTRAINT `fk_hospitals_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitals`
--

LOCK TABLES `hospitals` WRITE;
/*!40000 ALTER TABLE `hospitals` DISABLE KEYS */;
INSERT INTO `hospitals` VALUES (1,'Koregaon Park City Life Hospital',1,'Private',18.53620000,73.89400000,_binary '\æ\0\0\0\0\0~8gD‰2@\ð§\ÆK7yR@','LIC-99998','Koregaon Park Lane 1','Pune','Maharashtra','411001','+9120223344','verified','2026-06-24 09:36:59'),(2,'Pune Life Care Hospital',1,'Private',18.52040000,73.85670000,_binary '\æ\0\0\0\0\0¡\Ö4\ï8…2@\íž<,\ÔvR@','LIC-99997','456, MG Road, Camp','Pune','Maharashtra','411001','9876543210','verified','2026-06-24 09:36:59'),(3,'Mumbai General Hospital',2,'Government',19.07600000,72.87770000,_binary '\æ\0\0\0\0\0ú~j¼t3@À\ìž<,8R@','LIC-99995','Dharavi Main Road','Mumbai','Maharashtra','400017','+9122334455','verified','2026-06-24 09:36:59'),(4,'Surat Municipal Hospital',3,'Government',21.17020000,72.83110000,_binary '\æ\0\0\0\0\0z\Ç):’+5@)\í\r¾05R@','LIC-99994','Surat Ring Road','Surat','Gujarat','395003','+91261223344','verified','2026-06-24 09:36:59');
/*!40000 ALTER TABLE `hospitals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `hospital_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notifications_user` (`user_id`),
  KEY `fk_notifications_hospital` (`hospital_id`),
  CONSTRAINT `fk_notifications_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (3,NULL,2,'Urgent Blood Donation Request','Dear Chinmay Shete, Pune Life Care Hospital is running critically low on blood stock. Please consider visiting us to donate!','alert',0,'2026-06-24 09:37:00');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_codes`
--

DROP TABLE IF EXISTS `otp_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` char(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` enum('registration','login') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'registration',
  `expires_at` timestamp NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_otp_phone_purpose` (`phone`,`purpose`,`verified`),
  KEY `idx_otp_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_codes`
--

LOCK TABLES `otp_codes` WRITE;
/*!40000 ALTER TABLE `otp_codes` DISABLE KEYS */;
INSERT INTO `otp_codes` VALUES (1,'+919876543210','446756','registration','2026-06-24 07:21:10',1,'2026-06-24 07:16:09');
/*!40000 ALTER TABLE `otp_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` char(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_refresh_token_hash` (`token_hash`),
  KEY `idx_refresh_user` (`user_id`),
  KEY `idx_refresh_expires` (`expires_at`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,6,'4c21cf18ea7bf4e1cbf2ab21639995c45d1e12ada9dd3b8e29e6967d0ae9e655','2026-07-01 09:37:01',NULL,'2026-06-24 09:37:00'),(2,6,'b326511440d658a43a3f902707de3de00b4a2f9a6ad0ea4b64f876ec4b0919e0','2026-07-01 09:37:01',NULL,'2026-06-24 09:37:00'),(3,3,'987389c5e575fd8b7cca7d450f9dc9585e5a908e74db639420c1c420a532a4cc','2026-07-01 09:37:01',NULL,'2026-06-24 09:37:00'),(4,2,'46e91aa0b5ffd77ce0bdd6d4b9a36335238e386863c2270861b5ee965a8db918','2026-07-01 09:37:01',NULL,'2026-06-24 09:37:01'),(5,5,'3fa432e6b6b9f68e3a7dac8689e6648cca6de1c99ccf4f48ec817187288be32f','2026-07-01 09:37:01',NULL,'2026-06-24 09:37:01'),(6,2,'f320e112237659fb545428f6c1fabc6e4a79abb08b343a49f6eecebf3ab4a6a4','2026-07-01 09:37:01',NULL,'2026-06-24 09:37:01'),(7,6,'0c77f95ce5984976b948bbeb53926086f92c2b90b823648d11d57169c4caddfd','2026-07-01 09:37:10',NULL,'2026-06-24 09:37:09');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff_invites`
--

DROP TABLE IF EXISTS `staff_invites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff_invites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hospital_id` int NOT NULL,
  `invited_by` int DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_staff_invites_token` (`token`),
  KEY `idx_staff_invites_email` (`email`),
  KEY `fk_staff_invites_hospital` (`hospital_id`),
  KEY `fk_staff_invites_invited_by` (`invited_by`),
  CONSTRAINT `fk_staff_invites_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_staff_invites_invited_by` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff_invites`
--

LOCK TABLES `staff_invites` WRITE;
/*!40000 ALTER TABLE `staff_invites` DISABLE KEYS */;
/*!40000 ALTER TABLE `staff_invites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surgical_schedules`
--

DROP TABLE IF EXISTS `surgical_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `surgical_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hospital_id` int NOT NULL,
  `surgery_date` date NOT NULL,
  `surgery_type` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `blood_group` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `units` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_surgical_schedules_hosp_bg` (`hospital_id`,`blood_group`),
  CONSTRAINT `fk_surgical_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surgical_schedules`
--

LOCK TABLES `surgical_schedules` WRITE;
/*!40000 ALTER TABLE `surgical_schedules` DISABLE KEYS */;
INSERT INTO `surgical_schedules` VALUES (1,2,'2026-07-15','Cardiovascular Bypass','O+',3,'2026-06-24 09:37:00'),(2,1,'2026-07-20','Orthopedic Surgery','A+',4,'2026-06-24 09:37:00');
/*!40000 ALTER TABLE `surgical_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer_requests`
--

DROP TABLE IF EXISTS `transfer_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `from_hospital` int NOT NULL,
  `to_hospital` int NOT NULL,
  `blood_group` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `units` int NOT NULL,
  `status` enum('pending','accepted','rejected','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `priority` enum('low','medium','high','critical') COLLATE utf8mb4_unicode_ci DEFAULT 'medium',
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_transfer_requests_status` (`status`),
  KEY `fk_transfers_from` (`from_hospital`),
  KEY `fk_transfers_to` (`to_hospital`),
  CONSTRAINT `fk_transfers_from` FOREIGN KEY (`from_hospital`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transfers_to` FOREIGN KEY (`to_hospital`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer_requests`
--

LOCK TABLES `transfer_requests` WRITE;
/*!40000 ALTER TABLE `transfer_requests` DISABLE KEYS */;
INSERT INTO `transfer_requests` VALUES (1,1,2,'O+',2,'pending','high','Need 2 units of O+','2026-06-24 09:37:01'),(2,1,2,'O+',1,'pending','medium','Idempotency test','2026-06-24 09:37:01'),(3,1,2,'O+',3,'accepted','high',NULL,'2026-06-24 09:37:01'),(4,2,3,'A+',3,'accepted','high','Cross-district request','2026-06-24 09:37:01'),(5,4,3,'A+',2,'pending','high','Gujarat to Mumbai cross-state','2026-06-24 09:37:01'),(6,2,3,'A+',200,'pending','high','Large request','2026-06-24 09:37:01');
/*!40000 ALTER TABLE `transfer_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('donor','staff','admin','district','state','sysadmin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hospital_id` int DEFAULT NULL,
  `district_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('Active','Suspended','Pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_users_role` (`role`),
  KEY `fk_users_hospital` (`hospital_id`),
  KEY `fk_users_district` (`district_id`),
  CONSTRAINT `fk_users_district` FOREIGN KEY (`district_id`) REFERENCES `districts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'donor@example.com','+919876543210','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','donor',NULL,NULL,'2026-06-24 09:36:59',NULL,'Active','Amit Sharma','O+ Blood Donor'),(2,'hospital_admin@example.com','9876543210','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','admin',2,NULL,'2026-06-24 09:36:59','2026-06-24 09:37:01','Active','Dr. Kavita Deshmukh','Blood Bank Manager'),(3,'hospital_admin1@example.com','9876543211','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','admin',1,NULL,'2026-06-24 09:36:59','2026-06-24 09:37:01','Active','Dr. Alok Sen','Director KP Hospital'),(4,'district_admin@example.com','9876543212','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','district',NULL,1,'2026-06-24 09:36:59',NULL,'Active','Rajesh Patil','District Health Officer'),(5,'state_admin@example.com','9876543213','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','state',NULL,1,'2026-06-24 09:36:59','2026-06-24 09:37:01','Active','Vikram Malhotra','State Health Coordinator'),(6,'sysadmin@example.com','9876543214','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','sysadmin',NULL,NULL,'2026-06-24 09:36:59','2026-06-24 09:37:10','Active','System Administrator','Root Admin'),(7,'hospital_staff@example.com','9876543215','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','staff',2,NULL,'2026-06-24 09:36:59',NULL,'Active','Rohan Joshi','Blood Bank Technician'),(8,'pending_officer@example.com','9876543216','$2a$10$AVThMNmnJ26UVy9fEk3NLOJD6.aglEd0JHomwmWOT/e/FILxNHuuC','district',NULL,2,'2026-06-24 09:36:59',NULL,'Active','Sneha Kulkarni','Deputy Health Director');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-24 15:08:00
