package handlers

import (
	"net/http"
	"strconv"
	"time"

	"music-recommendation/pkg/models"
	"music-recommendation/repository"

	"github.com/gin-gonic/gin"
)

type ListenHandler struct {
	listenRepo *repository.ListenRepository
	userRepo   *repository.UserRepository
	songRepo   *repository.SongRepository
}

func NewListenHandler(listenRepo *repository.ListenRepository, userRepo *repository.UserRepository, songRepo *repository.SongRepository) *ListenHandler {
	return &ListenHandler{
		listenRepo: listenRepo,
		userRepo:   userRepo,
		songRepo:   songRepo,
	}
}

func (h *ListenHandler) RecordListen(c *gin.Context) {
	var listen models.Listen
	if err := c.ShouldBindJSON(&listen); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	listen.ListenDate = time.Now()

	// Obtener ciudad del usuario para grabar en listens_by_city
	user, err := h.userRepo.GetByID(listen.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Grabar en ambas tablas
	if err := h.listenRepo.Create(&listen); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	listenByCity := models.ListenByCity{
		City:       user.City,
		ListenDate: listen.ListenDate,
		UserID:     listen.UserID,
		SongID:     listen.SongID,
	}

	if err := h.listenRepo.RecordListenByCity(&listenByCity); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, listen)
}

func (h *ListenHandler) GetUserListens(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	listens, err := h.listenRepo.GetByUserID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, listens)
}

func (h *ListenHandler) GetRecommendations(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	// Obtener ciudad del usuario
	user, err := h.userRepo.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Obtener canciones populares en la ciudad del usuario
	songIDs, err := h.listenRepo.GetPopularSongsByCity(user.City, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Obtener detalles de las canciones
	var songs []models.Song
	for _, id := range songIDs {
		song, err := h.songRepo.GetByID(id)
		if err == nil {
			songs = append(songs, *song)
		}
	}

	c.JSON(http.StatusOK, songs)
}

func (h *ListenHandler) GetRecommendationsByGenre(c *gin.Context) {
	userID, err := strconv.Atoi(c.Param("user_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuario inválido"})
		return
	}

	genre := c.Param("genre")

	// Obtener ciudad del usuario
	user, err := h.userRepo.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// Obtener recomendaciones basadas en ciudad y género
	songIDs, err := h.listenRepo.GetRecommendationsByCityAndGenre(user.City, genre, 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Obtener detalles de las canciones
	var songs []models.Song
	for _, id := range songIDs {
		song, err := h.songRepo.GetByID(id)
		if err == nil {
			songs = append(songs, *song)
		}
	}

	c.JSON(http.StatusOK, songs)
}
