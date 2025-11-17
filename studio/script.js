jQuery(document).ready(function($) {

    const WEBHOOK_URL_LUONG_1 = "https://quyenntt820.app.n8n.cloud/webhook/creative-studio-1";
    const WEBHOOK_URL_LUONG_2 = "https://ai-agent.nocoai.vn/webhook/confirm_order";

    const uploadBtn = $('#upload-inspiration-btn');
    const fileInput = $('#inspiration-file-input');
    const inspirationGrid = $('.inspiration-grid'); 
    const generateBtn = $('#generate-btn'); 
    const confirmBtn = $('#confirm-btn');  

    const baseProductImages = {
        'coc-su': '../images/coc_tron.jpg',
        'binh-hoa': '../images/binh_tron.jpg',
        'dia-su': '../images/dia_tron.jpg'
    };
    
    const inspirationImages = {
        'coc-su': ['../images/HASAMI.jpg', '../images/ly 1.png', '../images/Generated Image October 19, 2025 - 10_56PM.png', '../images/lyy.jpg'],
        'binh-hoa': ['../images/bình 1.jpg', '../images/binh_3.jpg', '../images/bình hoa.jpg', '../images/binh_4.jpg'],
        'dia-su': ['../images/đĩa xanh.jpg', '../images/dia_4.jpg', '../images/đĩa.jpg', '../images/đĩa hoa.jpg']
    };

    const mockGenImages = {
        'coc-su': {
            main: 'https://raw.githubusercontent.com/Nttq-k23411/Images/61273456538206055c55a603f0b017372843c568/demo.png',
            variants: [
                'https://raw.githubusercontent.com/Nttq-k23411/Images/af79e364d889f784abd6023afaba24902868012a/demo1.1.png'
            ]
        },
        'binh-hoa': {
            main: 'https://raw.githubusercontent.com/Nttq-k23411/Images/29e68c028ec181e6dafad01e74e32b4980d978fe/demo3.png',
            variants: [
                'https://raw.githubusercontent.com/Nttq-k23411/Images/af79e364d889f784abd6023afaba24902868012a/demo3.1.png'
            ]
        },
        'dia-su': {
            main: 'https://raw.githubusercontent.com/Nttq-k23411/Images/61273456538206055c55a603f0b017372843c568/demo2.png',
            variants: [
                'https://raw.githubusercontent.com/Nttq-k23411/Images/af79e364d889f784abd6023afaba24902868012a/demo2.1.png'
            ]
        }
    };

    let finalImageUrl = '';
    let selectedInspirationUrl = ''; 
    let isRefining = false; 
    let refineCount = 0;    

    function updateInspirationGallery(shape) {
        const images = inspirationImages[shape];
        let galleryHtml = '';
        if (images && images.length > 0) {
            images.forEach((imgUrl, index) => {
                galleryHtml += `
                    <div class="inspiration-item">
                        <img src="${imgUrl}" alt="Mẫu ${shape} ${index + 1}">
                    </div>
                `;
            });
        }
        const uploadBtnHtml = `
            <div class="inspiration-item inspiration-upload-btn" id="upload-inspiration-btn" title="Tải ảnh lên">
                <i data-lucide="upload-cloud"></i>
            </div>`;
            
        inspirationGrid.html(galleryHtml + uploadBtnHtml); 
        
        attachInspirationClickEvent();
        lucide.createIcons();

        $('#upload-inspiration-btn').on('click', function() { fileInput.click(); });
    }

    function attachInspirationClickEvent() {
        $('.inspiration-grid .inspiration-item img').off('click').on('click', function() {
            const newSrc = $(this).attr('src');
            $('#image-result img').attr('src', newSrc);
            selectedInspirationUrl = newSrc; 
 
            resetGenerationState();
        });
    }

    function resetGenerationState() {
        finalImageUrl = ''; 
        isRefining = false;
        refineCount = 0;
        generateBtn.text('Tạo phác thảo').prop('disabled', false);
        confirmBtn.prop('disabled', true).text('Xác nhận thiết kế');
    }


    $('#select-product-shape').on('change', function() {
        const selectedShape = $(this).val();
        const newBaseImage = baseProductImages[selectedShape];
        $('#image-result img').attr('src', newBaseImage).attr('data-shape', selectedShape);
        updateInspirationGallery(selectedShape);
        
        resetGenerationState(); 
    });


    uploadBtn.on('click', function() { fileInput.click(); });
    fileInput.on('change', function(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) { 
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result; 
                const newImageHtml = `<div class="inspiration-item"><img src="${imageUrl}" alt="Uploaded"></div>`; 
                inspirationGrid.prepend(newImageHtml);
                $('#image-result img').attr('src', imageUrl);
                selectedInspirationUrl = imageUrl; 
                resetGenerationState();
                attachInspirationClickEvent();
            }
            reader.readAsDataURL(file); 
        } else if (file) {
            alert('Vui lòng chỉ chọn tệp hình ảnh.');
        }
        $(this).val('');
    });
    
    $('#select-signature').on('change', function() {
        if ($(this).val() === 'custom') {
            $('#custom-signature-input').show();
        } else {
            $('#custom-signature-input').hide();
        }
    });

    generateBtn.on('click', function() {
        

        const prompt = $('#prompt-input').val();
        if (!prompt) {
            alert('Vui lòng nhập ý tưởng vào Hộp Mô Tả!');
            return;
        }
        if (selectedInspirationUrl === '') {
            alert('Vui lòng chọn 1 ảnh cảm hứng để AI hiểu phong cách!');
            return;
        }

        if (!isRefining) {
            $(this).text('Đang tạo...').prop('disabled', true);
        } else {
            $(this).text('Đang tinh chỉnh...').prop('disabled', true);
        }
        confirmBtn.prop('disabled', true);

        const shape = $('#select-product-shape').val(); 
        const dataToSend = {
            shape: shape,
            prompt: prompt,
            inspiration: selectedInspirationUrl, 
            is_refine_mode: isRefining 
        };
        console.log("Sending to AI:", dataToSend);

        setTimeout(() => {
            const currentShapeData = mockGenImages[shape];
            
            if (!isRefining) {
                finalImageUrl = currentShapeData.main;

                isRefining = true;
                $(this).text('Tinh chỉnh').prop('disabled', false);
                
            } else {

                const variantIndex = refineCount % currentShapeData.variants.length;
                finalImageUrl = currentShapeData.variants[variantIndex];
                
                refineCount++; 
                $(this).text('Tinh chỉnh').prop('disabled', false);
            }

            $('#image-result img').fadeOut(200, function() {
                $(this).attr('src', finalImageUrl).fadeIn(200);
            });

            confirmBtn.prop('disabled', false);
            
        }); 
    });

    confirmBtn.on('click', async function() {
        if (!finalImageUrl) {
            alert('Cần có thiết kế trước khi xác nhận.'); return;
        }

        $(this).text('Đang xử lý...').prop('disabled', true);
        const customerNameFromSession = "Nguyen Van A"; 

        const dataToSend_Luong2 = {
            final_image_url: finalImageUrl,
            order_id: 'DH-' + Date.now(), 
            customer_name: customerNameFromSession, 
            product_id: "GOMSU_001", 
            shape: $('#select-product-shape').val(),
            prompt: $('#prompt-input').val(),
            material: $('#select-material').val(),
            signature: ($('#select-signature').val() === 'custom') ? $('#custom-signature-input').val() : $('#select-signature').val(),
            toggle_abstract: $('#toggle-abstract').is(':checked'),
            toggle_gold: $('#toggle-gold').is(':checked'),
            inspiration_image_url: selectedInspirationUrl 
        };

        console.log("Order Data:", dataToSend_Luong2);

        try {
            const response = await fetch(WEBHOOK_URL_LUONG_2, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend_Luong2) 
            });

            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            alert('Đã thêm thiết kế vào giỏ hàng và gửi đến xưởng!');
            $(this).text('Đã thêm vào giỏ!').prop('disabled', true);
            generateBtn.prop('disabled', true); 

        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi kết nối: ' + error.message);
            $(this).text('Xác nhận thiết kế').prop('disabled', false);
        }   
    });

    lucide.createIcons();
    attachInspirationClickEvent();
});