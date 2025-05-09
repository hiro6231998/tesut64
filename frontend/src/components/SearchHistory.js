import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';

function SearchHistory({ onSearchSelect }) {
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    // ローカルストレージから検索履歴を取得
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  const handleDelete = (index) => {
    const newHistory = searchHistory.filter((_, i) => i !== index);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSearchClick = (search) => {
    onSearchSelect(search);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <HistoryIcon sx={{ mr: 1 }} />
        <Typography variant="h6">検索履歴</Typography>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <List>
        {searchHistory.map((search, index) => (
          <ListItem
            key={index}
            button
            onClick={() => handleSearchClick(search)}
          >
            <ListItemText
              primary={search.term}
              secondary={`${search.genre} ${search.tags.join(', ')}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default SearchHistory; 