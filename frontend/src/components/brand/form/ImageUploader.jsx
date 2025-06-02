import React from 'react'
import {
	Upload,
	Button,
	Card,
	Radio,
	Input,
	Space,
	Typography,
	Image,
	message,
	Form,
} from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'

const { Dragger } = Upload
const { Text } = Typography

const ImageUploader = ({
	productImages = [],
	handleImageUpload,
	handleAltTextChange,
	handlePrimaryImageChange,
	handleImageDelete,
	maxImages = 5,
	form,
}) => {
	const uploadProps = {
		multiple: true,
		accept: 'image/*',
		beforeUpload: (file, fileList) => {
			if (productImages.length + fileList.length > maxImages) {
				message.error(`Можно загрузить не более ${maxImages} изображений`)
				return false
			}
			handleImageUpload(fileList)
			form.validateFields(['images']) // Валидируем поле после загрузки
			return false
		},
		showUploadList: false,
		disabled: productImages.length >= maxImages,
	}

	const handleDelete = id => {
		handleImageDelete(id)
		form.validateFields(['images']) // Валидируем поле после удаления
	}

	return (
		<Form.Item
			name='images'
			rules={[
				{
					validator: () =>
						productImages.length > 0
							? Promise.resolve()
							: Promise.reject(
									new Error('Необходимо загрузить хотя бы одно изображение')
							  ),
				},
			]}
		>
			<Card
				title='Изображения товара'
				bordered={false}
				style={{ border: '1px solid #d9d9d9' }}
				extra={
					<Text type='secondary' style={{ color: '#666' }}>
						{productImages.length}/{maxImages} изображений
					</Text>
				}
			>
				<Space direction='vertical' size='large' style={{ width: '100%' }}>
					<Dragger
						{...uploadProps}
						style={{
							background: '#fafafa',
							border: '1px dashed #d9d9d9',
						}}
					>
						<p className='ant-upload-drag-icon'>
							<UploadOutlined style={{ color: '#666' }} />
						</p>
						<p className='ant-upload-text' style={{ color: '#333' }}>
							Нажмите или перетащите файлы для загрузки
						</p>
						<p className='ant-upload-hint' style={{ color: '#666' }}>
							Поддерживаются форматы JPG, PNG (максимум {maxImages} изображений)
						</p>
					</Dragger>

					<div
						style={{
							display: 'grid',
							gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
							gap: 16,
						}}
					>
						{productImages.map(image => (
							<Card
								key={image.id}
								hoverable
								style={{ border: '1px solid #d9d9d9' }}
								cover={
									<Image
										src={image.image_path}
										alt={image.alt_text}
										style={{
											height: 160,
											objectFit: 'cover',
											backgroundColor: '#f5f5f5',
										}}
										preview={false}
									/>
								}
								actions={[
									<Button
										type='text'
										danger
										icon={<DeleteOutlined />}
										onClick={() => handleDelete(image.id)}
										style={{ color: '#666', borderColor: '#d9d9d9' }}
									/>,
								]}
							>
								<Space direction='vertical' style={{ width: '100%' }}>
									<Radio
										checked={image.is_primary}
										onChange={() => handlePrimaryImageChange(image.id)}
										style={{ color: '#333' }}
									>
										Основное
									</Radio>
									<Input
										placeholder='Описание изображения'
										value={image.alt_text}
										onChange={e =>
											handleAltTextChange(image.id, e.target.value)
										}
										style={{ borderColor: '#d9d9d9' }}
									/>
									<Text type='secondary' style={{ color: '#666' }}>
										Порядок: {image.display_order + 1}
									</Text>
								</Space>
							</Card>
						))}
					</div>
				</Space>
			</Card>
		</Form.Item>
	)
}

export default React.memo(ImageUploader)
