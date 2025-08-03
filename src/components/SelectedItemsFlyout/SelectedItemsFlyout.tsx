import { useSelector, useDispatch } from 'react-redux';
import {
  selectSelectedCharacters,
  clearSelectedCharacters,
} from '../../redux/charactersSlice';
import './SelectedItemsFlyout.css';

const SelectedItemsFlyout = () => {
  const dispatch = useDispatch();
  const selectedCharacters = useSelector(selectSelectedCharacters);
  const selectedCount = Object.keys(selectedCharacters).length;

  if (selectedCount === 0) {
    return null;
  }

  const handleUnselectAll = () => {
    dispatch(clearSelectedCharacters());
  };

  const handleDownload = () => {
    const characterData = Object.values(selectedCharacters);
    let csvContent = 'data:text/csv;charset=utf-8,';

    csvContent += 'ID,Name,Status,Species,Image URL,Episode Count\n';

    characterData.forEach((character) => {
      const row = [
        character.id,
        `"${character.name || ''}"`,
        `"${character.status || ''}"`,
        `"${character.species || ''}"`,
        `"${character.image || ''}"`,
        character.episode ? character.episode.length : 0,
      ];
      csvContent += row.join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedCount}_items.csv`);
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  return (
    <div className="selected-items-flyout">
      <div className="flyout-content">
        <div className="flyout-message">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </div>
        <div className="flyout-buttons">
          <button
            onClick={handleUnselectAll}
            className="flyout-button unselect-button"
          >
            Unselect all
          </button>
          <button
            onClick={handleDownload}
            className="flyout-button download-button"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectedItemsFlyout;
