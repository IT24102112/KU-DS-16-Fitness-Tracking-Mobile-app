import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../services/ThemeContext';

const API_BASE_URL = 'http://192.168.8.187:5000';

export default function ImagesTab({ data }) {
  const { theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!data) return null;

  const allImages = (data.progressImages || []).sort((a, b) => new Date(b.date) - new Date(a.date));
  const beforeAfter = data.beforeAfter || {};
  const hasBeforeAfter = beforeAfter.beforeImage && beforeAfter.afterImage;

  const imageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://192.168.8.187:5000/${path}`;
  };

  const renderImageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.imageItem}
      onPress={() => setSelectedImage(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageUrl(item.imageUrl) }}
        style={styles.imageThumb}
      />
      <Text style={[styles.imageDate, { color: theme.textMuted }]}>
        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>
      {item.notes && (
        <Text style={[styles.imageNotes, { color: theme.textMuted }]} numberOfLines={1}>
          {item.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Before/After Section */}
      {hasBeforeAfter && (
        <View style={[styles.beforeAfterContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Before & After</Text>

          <View style={styles.beforeAfterComparison}>
            {/* Before Image */}
            <TouchableOpacity
              style={styles.beforeAfterItem}
              onPress={() =>
                setSelectedImage({
                  imageUrl: beforeAfter.beforeImage,
                  date: beforeAfter.beforeDate,
                  isBefore: true,
                })
              }
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: imageUrl(beforeAfter.beforeImage) }}
                style={styles.beforeAfterImage}
              />
              <Text style={[styles.beforeAfterLabel, { color: theme.textMuted }]}>Before</Text>
            </TouchableOpacity>

            <View style={styles.arrowContainer}>
              <Text style={[styles.arrow, { color: theme.accent }]}>→</Text>
            </View>

            {/* After Image */}
            <TouchableOpacity
              style={styles.beforeAfterItem}
              onPress={() =>
                setSelectedImage({
                  imageUrl: beforeAfter.afterImage,
                  date: beforeAfter.afterDate,
                  isAfter: true,
                })
              }
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: imageUrl(beforeAfter.afterImage) }}
                style={styles.beforeAfterImage}
              />
              <Text style={[styles.beforeAfterLabel, { color: theme.textMuted }]}>After</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* All Progress Images */}
      {allImages && allImages.length > 0 && (
        <View style={[styles.imagesSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Progress Gallery</Text>
          <FlatList
            data={allImages}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.imageGrid}
          />
        </View>
      )}

      {!hasBeforeAfter && (!allImages || allImages.length === 0) && (
        <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>No progress images available</Text>
        </View>
      )}

      {/* Image Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalContent}
            onPress={() => setSelectedImage(null)}
          >
            <Image
              source={{ uri: imageUrl(selectedImage?.imageUrl) }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            {selectedImage?.notes && (
              <View style={styles.imageDetailsBox}>
                <Text style={[styles.imageDetailsText, { color: theme.textPrimary }]}>
                  {selectedImage.notes}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  beforeAfterContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  beforeAfterComparison: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  beforeAfterItem: {
    flex: 1,
    alignItems: 'center',
  },
  beforeAfterImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  beforeAfterLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 6,
  },
  beforeAfterLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  beforeAfterDate: {
    fontSize: 11,
    marginBottom: 4,
  },
  beforeAfterWeight: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 60,
  },
  arrowText: {
    fontSize: 28,
    fontWeight: '700',
  },
  progressSummary: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  progressItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  progressDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  progressLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  gallerySection: {
    marginBottom: 16,
  },
  imageGrid: {
    paddingBottom: 10,
  },
  imageRow: {
    gap: 10,
    marginBottom: 10,
  },
  imageItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imageThumb: {
    width: '100%',
    height: '100%',
  },
  imageDate: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  imageType: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 9,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  imageWeight: {
    position: 'absolute',
    top: 4,
    left: 4,
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  emptyContainer: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  imagePreviewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  fullImage: {
    width: Dimensions.get('window').width - 40,
    height: 400,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageInfo: {
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  imageInfoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  imageInfoDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  imageInfoWeight: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageInfoMeal: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  imageInfoNotes: {
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  imageDetailsBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  imageDetailsText: {
    fontSize: 14,
    color: '#fff',
  },
});
