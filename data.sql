-- MySQL dump 10.16  Distrib 10.1.26-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: db
-- ------------------------------------------------------
-- Server version	10.1.26-MariaDB-0+deb9u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `keyv`
--

DROP TABLE IF EXISTS `keyv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `keyv` (
  `key` varchar(11) DEFAULT NULL,
  `value` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keyv`
--

LOCK TABLES `keyv` WRITE;
/*!40000 ALTER TABLE `keyv` DISABLE KEYS */;
INSERT INTO `keyv` VALUES ('keyv:guilds','{\"value\":{\"589443192332746756\":{\"prefix\":\"?\"},\"419628763102314527\":{\"warns\":{\"312563856310534144\":[{\"date\":\"25/12/2018\",\"mod\":\"162629904981164032\",\"reason\":\"bad words\"}],\"290060595737395201\":[{\"date\":\"27/12/2018\",\"mod\":\"192710597106728960\",\"reason\":\"Spamming gif emojis. Told you not to do it. Pretty sure you were banned before for anti obedience before. Do it again and you will be permanently banned.\"},{\"date\":\"28/12/2018\",\"mod\":\"192710597106728960\",\"reason\":\"Swear abbreviation\"}],\"291303630701854724\":[{\"date\":\"31/1/2019\",\"mod\":\"462712474353926174\",\"reason\":\"breaking rule P.1R2, you\'re literally on your final warning any arguments or any minor problems in which you\'re somehow part of will result in you getting permanently banned(and you can\'t post a ban appeal)\"}],\"274031629658357760\":[{\"date\":\"12/2/2019\",\"mod\":\"462712474353926174\",\"reason\":\"advertising is not allowed, neither is DM advertising, next time it will be an instant ban, I hope I made myself clear.\"}],\"231967437535444994\":[{\"date\":\"14/2/2019\",\"mod\":\"462712474353926174\",\"reason\":\"This still counts as a form of advertisement, please be careful as the next time you get a warning will result in you getting banned\"}],\"397507126865559553\":[{\"date\":\"3/20/2019\",\"mod\":\"162629904981164032\",\"reason\":\"You were warned for advertising your YouTube video in the general chat. Please don\'t do it again or it will result in another warn.\"}],\"264627472379805696\":[{\"date\":\"3/24/2019\",\"mod\":\"192710597106728960\",\"reason\":\"Bypassing swear filter.\"}],\"292767036524724225\":[{\"date\":\"4/28/2019\",\"mod\":\"192710597106728960\",\"reason\":\"Swearing.\"}],\"295133726596268033\":[{\"date\":\"7/13/2019, 10:56:10 AM\",\"mod\":\"192710597106728960\",\"reason\":\"Advertising.\"}],\"443126480067887117\":[{\"date\":\"7/20/2019, 7:04:03 PM\",\"mod\":\"192710597106728960\",\"reason\":\"Mass pinging members.\"}],\"386856584954773515\":[{\"date\":\"8/30/2019, 4:10:38 PM\",\"mod\":\"192710597106728960\",\"reason\":\"Do not advertise servers.\"}],\"336222921649553429\":[{\"date\":\"10/5/2019, 11:06:25 PM\",\"mod\":\"192710597106728960\",\"reason\":\"Advertising? Was that even a rule? Might as well throw in a ping that could\'ve pinged about 500 users. Nothing bad about that either.\"}],\"193804309425553418\":[{\"date\":\"10/21/2019, 12:35:31 PM\",\"mod\":\"192710597106728960\",\"reason\":\"Look mate, last night was fun. Now it\'s just crossing a line.\"}],\"155791290099826689\":[{\"date\":\"1/18/2020, 9:41:08 PM\",\"mod\":\"359658850724478978\",\"reason\":\"Mass DMing weak defamatory messages.\"}],\"291689001734373376\":[{\"date\":\"1/24/2020, 12:54:31 PM\",\"mod\":\"359658850724478978\",\"reason\":\"Mass ping.\"}]}}},\"expires\":null}');
/*!40000 ALTER TABLE `keyv` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-08-22 15:20:24
