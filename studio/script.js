jQuery(document).ready(function($) {

    const WEBHOOK_URL_LUONG_1 = "https://[URL-Noco-AI-Luồng-1-Sáng-Tạo-Của-Bạn]";
    const WEBHOOK_URL_LUONG_2 = "https://ai-agent.nocoai.vn/webhook/confirm_order";

    const uploadBtn = $('#upload-inspiration-btn');
    const fileInput = $('#inspiration-file-input');
    const inspirationGrid = $('.inspiration-grid'); 

    const baseProductImages = {
        'coc-su': '../images/coc_tron.jpg',
        'binh-hoa': '../images/binh_tron.jpg',
        'dia-su': '../images/dia_tron.jpg'
    };
    
    const inspirationImages = {
        'coc-su': [
            '../images/HASAMI.jpg',
            '../images/ly 1.png',
            '../images/Generated Image October 19, 2025 - 10_56PM.png',
            '../images/lyy.jpg'
        ],
        'binh-hoa': [
            '../images/bình 1.jpg',
            '../images/binh_3.jpg',
            '../images/bình hoa.jpg',
            './images/bình tròn.jpg'
        ],
        'dia-su': [
            '../images/đĩa xanh.jpg',
            '../images/dia_4.jpg',
            '../images/đĩa.jpg',
            '../images/đĩa hoa.jpg'
        ]
    };

    let finalImageUrl = '';

    let selectedInspirationUrl = ''; 

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
        inspirationGrid.html(galleryHtml); 
        attachInspirationClickEvent();
    }

    function attachInspirationClickEvent() {
        $('.inspiration-grid .inspiration-item img').off('click').on('click', function() {
            const newSrc = $(this).attr('src');
            $('#image-result img').attr('src', newSrc);

            selectedInspirationUrl = newSrc; 

            finalImageUrl = ''; 
            $('#confirm-btn').prop('disabled', true).text('Thêm vào giỏ hàng');
        });
    }

    $('#select-product-shape').on('change', function() {
        const selectedShape = $(this).val();
        const newBaseImage = baseProductImages[selectedShape];
        $('#image-result img').attr('src', newBaseImage).attr('data-shape', selectedShape);
        updateInspirationGallery(selectedShape);
        
        finalImageUrl = ''; 
        selectedInspirationUrl = '';
        $('#confirm-btn').prop('disabled', true).text('Thêm vào giỏ hàng');
    });

    uploadBtn.on('click', function() { fileInput.click(); });

    fileInput.on('change', function(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) { 
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result; 
                const newImageHtml = `...`; 
                inspirationGrid.prepend(newImageHtml);
                $('#image-result img').attr('src', imageUrl);

                selectedInspirationUrl = imageUrl; 

                finalImageUrl = ''; 
                $('#confirm-btn').prop('disabled', true).text('Thêm vào giỏ hàng');
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

    lucide.createIcons();
    attachInspirationClickEvent();

    $('#generate-btn').on('click', function() {
        
        // 1. Kiểm tra Prompt
        const prompt = $('#prompt-input').val();
        if (!prompt) {
            alert('Vui lòng nhập ý tưởng vào Hộp Mô Tả!');
            return;
        }

        if (selectedInspirationUrl === '') {
            alert('Vui lòng chọn 1 ảnh từ Thư viện Cảm hứng (hoặc tải ảnh lên) để AI hiểu rõ phong cách của bạn!');
            return;
        }

        $(this).text('Đang tạo...').prop('disabled', true);
        $('#confirm-btn').prop('disabled', true);

        const shape = $('#select-product-shape').val(); 
        const isAbstract = $('#toggle-abstract').is(':checked'); 
        const hasGold = $('#toggle-gold').is(':checked'); 
        const material = $('#select-material').val(); 
        let signature = $('#select-signature').val(); 
        if (signature === 'custom') {
            signature = $('#custom-signature-input').val();
        }
        
        const dataToSend_Luong1 = {
            shape: shape,
            prompt: prompt,
            inspiration_image_url: selectedInspirationUrl, 
            toggle_abstract: isAbstract,
            toggle_gold: hasGold,
            material: material,
            signature: signature
        };

        console.log("Dữ liệu sẽ gửi cho Luồng 1 (Sáng tạo):", dataToSend_Luong1);

        setTimeout(() => {
            const currentShape = $('#select-product-shape').val(); 

            const fakeGithubImages = {
                'coc-su': 'https://raw.githubusercontent.com/Nttq-k23411/Images/61273456538206055c55a603f0b017372843c568/demo.png',
                'binh-hoa': 'https://raw.githubusercontent.com/Nttq-k23411/Images/29e68c028ec181e6dafad01e74e32b4980d978fe/demo3.png', 
                'dia-su': 'https://raw.githubusercontent.com/Nttq-k23411/Images/61273456538206055c55a603f0b017372843c568/demo2.png' 
            };
            
            finalImageUrl = fakeGithubImages[currentShape];

            $('#image-result img').attr('src', finalImageUrl);
            $(this).text('Xác nhận thiết kế').prop('disabled', false);
            $('#confirm-btn').prop('disabled', false);
        }, 2500);
    });


    $('#confirm-btn').on('click', async function() {

        if (!finalImageUrl) {
            alert('Bạn cần "Xác nhận thiết kế" trước khi thêm vào giỏ hàng.');
            return;
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

        console.log("Dữ liệu sẽ gửi cho Luồng 2 (Sản xuất):", dataToSend_Luong2);

        try {
            const response = await fetch(WEBHOOK_URL_LUONG_2, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend_Luong2) 
            });

            if (!response.ok) {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                alert('Đã thêm thiết kế vào giỏ hàng và gửi đến xưởng!');
                $(this).text('Đã thêm!').prop('disabled', true);
            } else {
                throw new Error('Hệ thống xử lý đơn hàng gặp lỗi.');
            }

        } catch (error) {
            console.error('Lỗi khi gọi Luồng 2:', error);
            alert('Đã xảy ra lỗi khi chốt đơn: ' + error.message);
            $(this).text('Thêm vào giỏ hàng').prop('disabled', false);
        }   
    });

});