package handlers

import (
	"net/http"
	"strconv"

	"music-recommendation/pkg/models"
	"music-recommendation/repository"

	"github.com/gin-gonic/gin"
)

type SongHandler struct {
	repo *repository.SongRepository
}

func NewSongHandler(repo *repository.SongRepository) *SongHandler {
	return &SongHandler{repo: repo}
}

func (h *SongHandler) CreateSong(c *gin.Context) {
	var song models.Song
	if err := c.ShouldBindJSON(&song); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.repo.Create(&song); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, song)
}

func (h *SongHandler) GetSong(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	song, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Canción no encontrada"})
		return
	}

	c.JSON(http.StatusOK, song)
}

func (h *SongHandler) GetSongsByGenre(c *gin.Context) {
	genre := c.Param("genre")
	songs, err := h.repo.GetByGenre(genre)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, songs)
}
